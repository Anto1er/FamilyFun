import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { useFamilyStore } from '@/stores/familyStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';

export default function ParentGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { gifts, approveGift, rejectGift } = useGiftsStore();
  const { members } = useFamilyStore();

  const [pointsCost, setPointsCost] = useState('');
  const [loading, setLoading] = useState(false);

  const gift = gifts.find((g) => g.id === id);
  const childName = gift ? members.find((m) => m.id === gift.child_id)?.display_name : '';

  if (!gift) return null;

  const handleApprove = async () => {
    if (!pointsCost || !profile) return;
    setLoading(true);
    try {
      await approveGift(gift.id, parseInt(pointsCost, 10), profile.id);
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectGift(gift.id);
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Ionicons name="gift" size={48} color={COLORS.secondary} />
        <Text style={styles.title}>{gift.title}</Text>
        <Text style={styles.child}>{childName}</Text>
        {gift.description && <Text style={styles.description}>{gift.description}</Text>}
        {gift.link_url && (
          <Text style={styles.link} numberOfLines={1}>{gift.link_url}</Text>
        )}
      </Card>

      {gift.status === 'pending_approval' && (
        <View style={styles.actions}>
          <Input
            label={t('gifts.setCost')}
            value={pointsCost}
            onChangeText={setPointsCost}
            keyboardType="number-pad"
            placeholder="Ex: 50"
          />

          <Button
            title={t('gifts.approve')}
            onPress={handleApprove}
            loading={loading}
            disabled={!pointsCost}
            style={styles.button}
          />

          <Button
            title={t('gifts.reject')}
            onPress={handleReject}
            variant="danger"
            style={styles.button}
          />
        </View>
      )}

      {gift.status === 'approved' && (
        <Card style={styles.approvedCard}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.approvedText}>
            {t('gifts.approved')} - {gift.points_cost} pts
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  card: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  child: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  link: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  approvedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#E8F5E9',
  },
  approvedText: {
    color: COLORS.success,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
});
