/**
 * ProfileScreen Component
 * 
 * User profile with statistics and menu items
 * - Avatar and user info
 * - Statistics (routes, km, warnings)
 * - Menu items (vehicle, history, settings, about, logout)
 * 
 * @example
 * ```tsx
 * <Tab.Screen name="Profile" component={ProfileScreen} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loading } from '@components/common';
import { useAuthStore, useRouteStore, useWarningStore } from '@store';
import { styles } from './styles';
import Avatar from './components/Avatar';
import StatCard from './components/StatCard';
import MenuItem from './components/MenuItem';
import type { ProfileScreenProps, UserStats } from './types';

/**
 * ProfileScreen Component
 */
export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const routeHistory = useRouteStore((state) => state.routeHistory);
  const userWarnings = useWarningStore((state) => state.userWarnings);

  const [stats, setStats] = useState<UserStats>({
    totalRoutes: 0,
    totalKm: 0,
    totalWarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load stats on mount
   */
  useEffect(() => {
    loadStats();
  }, [routeHistory, userWarnings]);

  /**
   * Load user statistics
   */
  const loadStats = async () => {
    setIsLoading(true);

    try {
      // Calculate total routes
      const totalRoutes = routeHistory.length;

      // Calculate total km
      const totalKm = routeHistory.reduce((sum, route) => {
        return sum + route.distance / 1000; // Convert meters to km
      }, 0);

      // Get total warnings
      const totalWarnings = userWarnings.length;

      setStats({
        totalRoutes,
        totalKm: Math.round(totalKm),
        totalWarnings,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will auto redirect to Auth screen
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılamadı');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            uri={user?.photoURL}
            size={80}
            name={user?.displayName || undefined}
          />
          <Text style={styles.name}>{user?.displayName || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="🗺️"
            label="Rota"
            value={stats.totalRoutes}
          />
          <StatCard
            icon="📏"
            label="Kilometre"
            value={`${stats.totalKm}`}
          />
          <StatCard
            icon="⚠️"
            label="Uyarı"
            value={stats.totalWarnings}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="🚛"
            label="Araç Bilgileri"
            onPress={() => navigation.navigate('VehicleInfo')}
          />

          <MenuItem
            icon="📜"
            label="Rota Geçmişi"
            onPress={() => navigation.navigate('History')}
          />

          <MenuItem
            icon="⚙️"
            label="Ayarlar"
            onPress={() => navigation.navigate('Settings')}
          />

          <MenuItem
            icon="ℹ️"
            label="Hakkında"
            onPress={() => navigation.navigate('About')}
          />

          <MenuItem
            icon="🚪"
            label="Çıkış Yap"
            onPress={handleLogout}
            isDestructive
            showChevron={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
