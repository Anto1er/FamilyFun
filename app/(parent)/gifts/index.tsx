import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { useFamilyStore } from '@/stores/familyStore';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { Gift } from '@/types';

export default function ParentGiftsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { gifts, loading, fetchGifts } = useGiftsStore();
  const { members } = useFamilyStore();
  const [refreshing, setRefreshing] = useState(false);

  const familyId = profile?.family_id;
  const pendingGifts = gifts.filter((g) => g.status === 'pending_approval');
  const approvedGifts = gifts.filter((g) => g.status === 'approved');

  useEffect(() => {
    if (familyId) fetchGifts(familyId);
  }, [familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (familyId) await fetchGifts(familyId);
    setRefreshing(false);
  };

  const getChildName = (childId: string) =>
    members.find((m) => m.id === childId)?.display_name ?? '?';

  const renderGift = ({ item }: { item: Gift }) => (
    <TouchableOpacity onPress={() => router.push(`/(parent)/gifts/${item.id}`)}>
      <Card style={styles.giftCard}>
        <View style={styles.giftRow}>
          <Ionicons name="gift" size={24} color={COLORS.secondary} />
          <View style={styles.giftInfo}>
            <Text style={styles.giftTitle}>{item.title}</Text>
            <Text style={styles.giftChild}>{getChildName(item.child_id)}</Text>
          </View>
          {item.status === 'pending_approval' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{t('gifts.pendingApproval')}</Text>
            </View>
          )}
          {item.points_cost !== null && (
            <Text style={styles.costText}>{item.points_cost} pts</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const allGifts = [...pendingGifts, ...approvedGifts];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={allGifts}
      keyExtractor={(item) => item.id}
      renderItem={renderGift}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <TouchableOpacity onPress={() => router.push('/(parent)/gifts/add')} activeOpacity={0.7}>
          <Card style={styles.addCard}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.addText}>{t('gifts.add')}</Text>
          </Card>
        </TouchableOpacity>
      }
      ListEmptyComponent={
        !loading ? <EmptyState icon="gift-outline" title={t('gifts.noGifts')} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
  },
  giftCard: {
    marginBottom: SPACING.md,
  },
  giftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  giftTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  giftChild: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '600',
  },
  costText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  addText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
