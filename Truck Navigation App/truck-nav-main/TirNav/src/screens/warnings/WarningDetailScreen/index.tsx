/**
 * WarningDetailScreen Component
 * 
 * Display detailed warning information with:
 * - Warning type and description
 * - Photo viewer with lightbox
 * - Location map
 * - Upvote/downvote functionality
 * - Share and delete actions
 * 
 * @example
 * ```tsx
 * navigation.navigate('WarningDetail', { warningId: 'warning_123' });
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import Toast from 'react-native-toast-message';
import { Button, Loading, ErrorView } from '@components/common';
import { useAuthStore, useWarningStore } from '@store';
import { firestoreService } from '@services/firebase';
import { graphHopperService } from '@services/routing';
import { styles } from './styles';
import WarningHeader from './components/WarningHeader';
import WarningInfo from './components/WarningInfo';
import MiniMap from './components/MiniMap';
import VoteButton from './components/VoteButton';
import type { WarningDetailScreenProps, UserVote } from './types';
import type { Warning } from '@types';

/**
 * WarningDetailScreen Component
 */
export default function WarningDetailScreen({
  route,
  navigation,
}: WarningDetailScreenProps) {
  const { warningId } = route.params;

  // Store
  const user = useAuthStore((state) => state.user);
  const deleteWarning = useWarningStore((state) => state.deleteWarning);

  // State
  const [warning, setWarning] = useState<Warning | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<UserVote>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load warning on mount
   */
  useEffect(() => {
    loadWarning();
  }, [warningId]);

  /**
   * Load address when location changes
   */
  useEffect(() => {
    if (warning) {
      loadAddress();
    }
  }, [warning?.location]);

  /**
   * Load warning data
   */
  const loadWarning = async () => {
    setIsLoading(true);

    try {
      // Get warning from Firestore
      const data = await firestoreService.getWarningById(warningId);
      setWarning(data);

      // Check if user has voted
      if (user) {
        const vote = await firestoreService.getUserVote(warningId, user.id);
        setUserVote(vote);
      }
    } catch (error) {
      console.error('Load warning error:', error);
      Alert.alert('Hata', 'Uyarı yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load address from coordinates
   */
  const loadAddress = async () => {
    if (!warning) return;

    try {
      const addr = await graphHopperService.reverseGeocode(warning.location);
      setAddress(addr);
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setAddress('Adres alınamadı');
    }
  };

  /**
   * Handle vote (upvote/downvote)
   */
  const handleVote = async (type: 'up' | 'down') => {
    if (!user || !warning) {
      Alert.alert('Giriş Gerekli', 'Oy vermek için giriş yapmalısınız');
      return;
    }

    try {
      if (userVote === type) {
        // Remove vote
        await firestoreService.removeVote(warningId, user.id);
        setUserVote(null);

        // Update local state
        setWarning((prev) => ({
          ...prev!,
          upvotes: type === 'up' ? prev!.upvotes - 1 : prev!.upvotes,
          downvotes: type === 'down' ? prev!.downvotes - 1 : prev!.downvotes,
        }));
      } else {
        // Add or change vote
        await firestoreService.vote(warningId, user.id, type);

        // Update local state
        setWarning((prev) => {
          const upvotes =
            type === 'up'
              ? prev!.upvotes + 1
              : userVote === 'up'
              ? prev!.upvotes - 1
              : prev!.upvotes;

          const downvotes =
            type === 'down'
              ? prev!.downvotes + 1
              : userVote === 'down'
              ? prev!.downvotes - 1
              : prev!.downvotes;

          return { ...prev!, upvotes, downvotes };
        });

        setUserVote(type);
      }
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('Hata', 'Oy kullanılamadı. Lütfen tekrar deneyin.');
    }
  };

  /**
   * Handle share
   */
  const handleShare = async () => {
    if (!warning) return;

    try {
      const message = `
⚠️ TırNav Uyarı

📍 Konum: ${address || 'Bilinmeyen'}
📝 ${warning.description}

👍 ${warning.upvotes} | 👎 ${warning.downvotes}
      `.trim();

      await Share.share({
        message,
        title: 'TırNav Uyarı',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    Alert.alert(
      'Uyarıyı Sil',
      'Bu uyarıyı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };

  /**
   * Perform delete operation
   */
  const performDelete = async () => {
    if (!warning) return;

    setIsDeleting(true);

    try {
      await deleteWarning(warningId);

      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Uyarı silindi',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Delete warning error:', error);
      Alert.alert('Hata', 'Uyarı silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle map press
   */
  const handleMapPress = () => {
    if (!warning) return;

    // Navigate to map with warning location
    navigation.navigate('MapScreen', {
      focusLocation: warning.location,
      focusWarningId: warningId,
    });
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Loading />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (!warning) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ErrorView
            message="Uyarı bulunamadı"
            onRetry={loadWarning}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === warning.createdBy;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <WarningHeader type={warning.type} />

        {/* Image */}
        {warning.imageUrl && (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setIsImageViewerVisible(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: warning.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>🔍 Büyüt</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Açıklama</Text>
          <Text style={styles.descriptionText}>{warning.description}</Text>
        </View>

        {/* Info */}
        <WarningInfo
          createdBy="Kullanıcı" // TODO: Get user name from Firestore
          createdAt={warning.createdAt}
          location={warning.location}
          address={address}
        />

        {/* Map */}
        <MiniMap location={warning.location} onPress={handleMapPress} />

        {/* Vote Buttons */}
        <View style={styles.voteContainer}>
          <VoteButton
            type="up"
            count={warning.upvotes}
            isActive={userVote === 'up'}
            onPress={() => handleVote('up')}
          />
          <VoteButton
            type="down"
            count={warning.downvotes}
            isActive={userVote === 'down'}
            onPress={() => handleVote('down')}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Paylaş"
            variant="outline"
            size="medium"
            onPress={handleShare}
            style={styles.actionButton}
          />

          {isOwner && (
            <Button
              title="Sil"
              variant="outline"
              size="medium"
              onPress={handleDelete}
              isLoading={isDeleting}
              style={[styles.actionButton, styles.deleteButton]}
            />
          )}
        </View>
      </ScrollView>

      {/* Image Viewer (Lightbox) */}
      {warning.imageUrl && (
        <ImageView
          images={[{ uri: warning.imageUrl }]}
          imageIndex={0}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
