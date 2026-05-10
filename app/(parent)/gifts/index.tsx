import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { useFamilyStore } from '@/stores/familyStore';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Touchable } from '@/components/ui/Touchable';
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
    <Touchable onPress={() => router.push(`/(parent)/gifts/${item.id}`)}>
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
    </Touchable>
  );

  const allGifts = [...pendingGifts, ...approvedGifts];

  return (
    <View style={styles.wrapper}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={allGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderGift}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <EmptyState icon="gift-outline" title={t('gifts.noGifts')} /> : null
        }
      />
      <Touchable
        style={styles.fab}
        onPress={() => router.push('/(parent)/gifts/add')}
      >
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </Touchable>
    </View>
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
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
