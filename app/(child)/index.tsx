import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';

export default function ChildDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, fetchProfile } = useAuthStore();
  const { missions, fetchMissions } = useMissionsStore();
  const { gifts, fetchGifts } = useGiftsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const familyId = profile?.family_id;

  useEffect(() => {
    if (familyId) {
      fetchMissions(familyId);
      fetchGifts(familyId);
    }
  }, [familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    if (familyId) {
      await Promise.all([fetchMissions(familyId), fetchGifts(familyId)]);
    }
    setRefreshing(false);
  };

  const approvedGifts = gifts.filter((g) => g.status === 'approved' && g.child_id === profile?.id);
  const activeMissions = missions.filter((m) => m.status === 'active');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Points Balance */}
      <Card style={styles.pointsCard}>
        <Ionicons name="star" size={32} color={COLORS.warning} />
        <Text style={styles.pointsValue}>{profile?.points_balance ?? 0}</Text>
        <Text style={styles.pointsLabel}>{t('dashboard.pointsBalance')}</Text>
      </Card>

      {/* Navigation Cards */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push('/(child)/missions')}
          activeOpacity={0.7}
        >
          <Card style={styles.statCard}>
            <Ionicons name="rocket" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{activeMissions.length}</Text>
            <Text style={styles.statLabel}>{t('missions.available')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={styles.chevron} />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push('/(child)/wishlist')}
          activeOpacity={0.7}
        >
          <Card style={styles.statCard}>
            <Ionicons name="gift" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{approvedGifts.length}</Text>
            <Text style={styles.statLabel}>{t('gifts.title')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={styles.chevron} />
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  pointsCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginBottom: SPACING.md,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  pointsLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chevron: {
    marginTop: SPACING.sm,
  },
});
