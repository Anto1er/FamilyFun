import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Touchable } from '@/components/ui/Touchable';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { Mission } from '@/types';

export default function ParentMissionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { missions, submissions, loading, fetchMissions, fetchSubmissions } = useMissionsStore();
  const [refreshing, setRefreshing] = useState(false);

  const familyId = profile?.family_id;

  useEffect(() => {
    if (familyId) {
      fetchMissions(familyId);
      fetchSubmissions(familyId);
    }
  }, [familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (familyId) {
      await Promise.all([fetchMissions(familyId), fetchSubmissions(familyId)]);
    }
    setRefreshing(false);
  };

  const getPendingCount = (missionId: string) =>
    submissions.filter((s) => s.mission_id === missionId && s.status === 'pending').length;

  const renderMission = ({ item }: { item: Mission }) => {
    const pendingCount = getPendingCount(item.id);
    return (
      <Touchable onPress={() => router.push(`/(parent)/missions/${item.id}`)}>
        <Card style={styles.missionCard}>
          <View style={styles.missionRow}>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{item.title}</Text>
              <Text style={styles.missionPoints}>+{item.points_reward} pts</Text>
            </View>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </View>
        </Card>
      </Touchable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderMission}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <EmptyState icon="rocket-outline" title={t('missions.noMissions')} /> : null
        }
      />
      <View style={styles.fabContainer}>
        <Touchable
          style={styles.fab}
          onPress={() => router.push('/(parent)/missions/create')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Touchable>
      </View>
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
    paddingBottom: 80,
  },
  missionCard: {
    marginBottom: SPACING.md,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  missionPoints: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
