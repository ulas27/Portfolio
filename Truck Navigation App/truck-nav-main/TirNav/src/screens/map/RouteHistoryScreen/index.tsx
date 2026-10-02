/**
 * RouteHistoryScreen Component
 * 
 * Display route history with:
 * - Date-based grouping
 * - Search functionality
 * - Filter options
 * - Swipe to delete
 * - Pull to refresh
 * - Route reuse
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="History" component={RouteHistoryScreen} />
 * ```
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import {
  isSameDay,
  subDays,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  format,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import Toast from 'react-native-toast-message';
import { Button, EmptyState } from '@components/common';
import { useRouteStore } from '@store';
import { styles } from './styles';
import SearchBar from './components/SearchBar';
import FilterChip from './components/FilterChip';
import RouteCard from './components/RouteCard';
import type {
  RouteHistoryScreenProps,
  FilterType,
  GroupedRoutes,
  RouteSection,
} from './types';

/**
 * RouteHistoryScreen Component
 */
export default function RouteHistoryScreen({
  navigation,
}: RouteHistoryScreenProps) {
  const routeHistory = useRouteStore((state) => state.routeHistory);
  const removeFromHistory = useRouteStore((state) => state.removeFromHistory);
  const selectRoute = useRouteStore((state) => state.selectRoute);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Filter routes based on search and date filter
   */
  const filteredRoutes = useMemo(() => {
    let routes = [...routeHistory];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      routes = routes.filter(
        (route) =>
          route.startPoint.address?.toLowerCase().includes(query) ||
          route.endPoint.address?.toLowerCase().includes(query)
      );
    }

    // Date filter
    const now = new Date();
    switch (filter) {
      case 'today':
        routes = routes.filter((r) => isSameDay(r.createdAt, now));
        break;
      case 'week':
        routes = routes.filter((r) =>
          isWithinInterval(r.createdAt, {
            start: startOfWeek(now, { locale: tr }),
            end: endOfWeek(now, { locale: tr }),
          })
        );
        break;
      case 'month':
        routes = routes.filter((r) => isSameMonth(r.createdAt, now));
        break;
    }

    // Sort by date (newest first)
    return routes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [routeHistory, searchQuery, filter]);

  /**
   * Group routes by date
   */
  const groupedRoutes = useMemo((): GroupedRoutes => {
    const groups: GroupedRoutes = {};
    const now = new Date();

    filteredRoutes.forEach((route) => {
      let key: string;

      if (isSameDay(route.createdAt, now)) {
        key = 'Bugün';
      } else if (isSameDay(route.createdAt, subDays(now, 1))) {
        key = 'Dün';
      } else if (
        isWithinInterval(route.createdAt, {
          start: startOfWeek(now, { locale: tr }),
          end: endOfWeek(now, { locale: tr }),
        })
      ) {
        key = 'Bu Hafta';
      } else if (isSameMonth(route.createdAt, now)) {
        key = 'Bu Ay';
      } else {
        key = format(route.createdAt, 'MMMM yyyy', { locale: tr });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(route);
    });

    return groups;
  }, [filteredRoutes]);

  /**
   * Convert grouped routes to sections
   */
  const sections = useMemo((): RouteSection[] => {
    return Object.entries(groupedRoutes).map(([title, data]) => ({
      title,
      data,
    }));
  }, [groupedRoutes]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh (in real app, reload from AsyncStorage or Firestore)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  /**
   * Handle delete route
   */
  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Rotayı Sil',
      'Bu rotayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromHistory(routeId);
              Toast.show({
                type: 'success',
                text1: 'Rota silindi',
              });
            } catch (error) {
              console.error('Delete route error:', error);
              Alert.alert('Hata', 'Rota silinemedi');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle route press
   */
  const handleRoutePress = (routeId: string) => {
    navigation.navigate('RouteDetail', { routeId });
  };

  /**
   * Handle reuse route
   */
  const handleReuseRoute = async (route: any) => {
    try {
      await selectRoute(route);
      navigation.navigate('MapScreen');
      Toast.show({
        type: 'success',
        text1: 'Rota seçildi',
        text2: 'Haritada görüntüleniyor',
      });
    } catch (error) {
      console.error('Reuse route error:', error);
      Alert.alert('Hata', 'Rota yüklenemedi');
    }
  };

  /**
   * Render swipeable delete action
   */
  const renderRightActions = (routeId: string) => {
    return (
      <View style={styles.deleteAction}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </View>
    );
  };

  /**
   * Render empty state
   */
  if (routeHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyTitle}>Henüz rota geçmişiniz yok</Text>
          <Text style={styles.emptyDescription}>
            İlk rotanızı oluşturarak başlayın
          </Text>
          <Button
            title="İlk Rotayı Oluştur"
            onPress={() => navigation.navigate('MapScreen')}
            variant="primary"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render empty filtered state
   */
  if (filteredRoutes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip
            label="Tümü"
            isActive={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Bugün"
            isActive={filter === 'today'}
            onPress={() => setFilter('today')}
          />
          <FilterChip
            label="Bu Hafta"
            isActive={filter === 'week'}
            onPress={() => setFilter('week')}
          />
          <FilterChip
            label="Bu Ay"
            isActive={filter === 'month'}
            onPress={() => setFilter('month')}
          />
        </ScrollView>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
          <Text style={styles.emptyDescription}>
            Farklı filtreler veya arama terimleri deneyin
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterChip
          label="Tümü"
          isActive={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label="Bugün"
          isActive={filter === 'today'}
          onPress={() => setFilter('today')}
        />
        <FilterChip
          label="Bu Hafta"
          isActive={filter === 'week'}
          onPress={() => setFilter('week')}
        />
        <FilterChip
          label="Bu Ay"
          isActive={filter === 'month'}
          onPress={() => setFilter('month')}
        />
      </ScrollView>

      {/* Route List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            onSwipeableOpen={() => handleDeleteRoute(item.id)}
          >
            <RouteCard
              route={item}
              onPress={() => handleRoutePress(item.id)}
              onReuse={() => handleReuseRoute(item)}
            />
          </Swipeable>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        stickySectionHeadersEnabled
      />
    </SafeAreaView>
  );
}
