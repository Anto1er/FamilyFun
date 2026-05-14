import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { Card } from '@/components/ui/Card';
import { Touchable } from '@/components/ui/Touchable';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';

export default function ChildDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const points = profile?.points_balance ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Points Balance with Gradient */}
      <LinearGradient
        colors={['#FF9800', '#FFB74D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.pointsGradient, { paddingTop: insets.top + SPACING.xl }]}
      >
        <Text style={styles.welcomeText}>
          {t('dashboard.welcome', { name: profile?.display_name ?? '' })}
        </Text>
        <View style={styles.pointsIconContainer}>
          <Ionicons name="star" size={28} color="#FFF" />
        </View>
        <Text style={styles.pointsValue}>{points}</Text>
        <Text style={styles.pointsLabel}>{t('dashboard.pointsBalance')}</Text>
      </LinearGradient>

      {/* Navigation Cards */}
      <View style={styles.statsRow}>
        <Touchable
          style={{ flex: 1 }}
          onPress={() => router.push('/(child)/missions')}
        >
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '14' }]}>
              <Ionicons name="rocket" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{activeMissions.length}</Text>
            <Text style={styles.statLabel}>{t('missions.available')}</Text>
            <View style={styles.statChevron}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
            </View>
          </Card>
        </Touchable>

        <Touchable
          style={{ flex: 1 }}
          onPress={() => router.push('/(child)/wishlist')}
        >
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.secondary + '14' }]}>
              <Ionicons name="gift" size={22} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{approvedGifts.length}</Text>
            <Text style={styles.statLabel}>{t('gifts.title')}</Text>
            <View style={styles.statChevron}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
            </View>
          </Card>
        </Touchable>
      </View>

      {/* Whiteboard Card */}
      <Touchable
        style={styles.boardRow}
        onPress={() => router.push('/(child)/board')}
      >
        <Card style={styles.boardCard}>
          <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '14' }]}>
            <Ionicons name="color-palette" size={22} color={COLORS.success} />
          </View>
          <Text style={styles.statLabel}>{t('board.title')}</Text>
          <View style={styles.statChevron}>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
          </View>
        </Card>
      </Touchable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },

  // Points card
  welcomeText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  pointsGradient: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  pointsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: SPACING.xs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  boardRow: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  boardCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  statChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
});
