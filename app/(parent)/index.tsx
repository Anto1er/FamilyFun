import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useFamilyStore } from '@/stores/familyStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { useGiftsStore } from '@/stores/giftsStore';
import { Card } from '@/components/ui/Card';
import { Touchable } from '@/components/ui/Touchable';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';
import { Profile } from '@/types';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { family, members, fetchFamily, fetchMembers } = useFamilyStore();
  const { missions, submissions, fetchMissions, fetchSubmissions } = useMissionsStore();
  const { gifts, fetchGifts } = useGiftsStore();
  const [refreshing, setRefreshing] = useState(false);

  const familyId = profile?.family_id;
  const children = members.filter((m) => m.role === 'child');
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const activeMissions = missions.filter((m) => m.status === 'active');
  const pendingGifts = gifts.filter((g) => g.status === 'pending');

  useEffect(() => {
    if (familyId) {
      fetchFamily(familyId);
      fetchMembers(familyId);
      fetchMissions(familyId);
      fetchSubmissions(familyId);
      fetchGifts(familyId);
    }
  }, [familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (familyId) {
      await Promise.all([
        fetchFamily(familyId),
        fetchMembers(familyId),
        fetchMissions(familyId),
        fetchSubmissions(familyId),
        fetchGifts(familyId),
      ]);
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Pending Validations */}
      {pendingSubmissions.length > 0 && (
        <Touchable onPress={() => router.push('/(parent)/missions')}>
          <Card style={styles.alertCard}>
            <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
            <Text style={styles.alertText}>
              {pendingSubmissions.length} {t('dashboard.pendingValidations').toLowerCase()}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.warning} />
          </Card>
        </Touchable>
      )}

      {/* Missions Section */}
      <Text style={styles.sectionTitle}>{t('missions.title')}</Text>
      <Touchable
        onPress={() => router.push('/(parent)/missions')}
      >
        <Card style={styles.missionCard}>
          <View style={styles.missionRow}>
            <Ionicons name="rocket" size={28} color={COLORS.primary} />
            <View style={styles.missionInfo}>
              <Text style={styles.missionValue}>{activeMissions.length} {t('missions.available').toLowerCase()}</Text>
              {pendingSubmissions.length > 0 && (
                <Text style={styles.missionPending}>
                  {pendingSubmissions.length} {t('dashboard.pendingValidations').toLowerCase()}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </View>
        </Card>
      </Touchable>

      <Touchable
        onPress={() => router.push('/(parent)/missions/create')}
      >
        <Card style={styles.addCard}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addText}>{t('missions.create')}</Text>
        </Card>
      </Touchable>

      {/* Children Section */}
      <Text style={styles.sectionTitle}>{t('dashboard.children')}</Text>
      {children.length > 0 ? (
        children.map((child) => (
          <Touchable
            key={child.id}
            onPress={() => router.push(`/child-detail/${child.id}`)}
          >
            <Card style={styles.childCard}>
              <View style={styles.childRow}>
                <View style={styles.avatar}>
                  <Ionicons name="happy" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.display_name}</Text>
                  <Text style={styles.childPoints}>{child.points_balance} pts</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </View>
            </Card>
          </Touchable>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('family.shareCode')}</Text>
          {family?.invite_code && (
            <Text style={styles.inviteCode}>{family.invite_code}</Text>
          )}
        </Card>
      )}

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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#FFF9E6',
    marginBottom: SPACING.md,
  },
  alertText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.warning,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  missionCard: {
    marginBottom: SPACING.sm,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  missionValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  missionPending: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginTop: 2,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.primary,
  },
  childCard: {
    marginBottom: SPACING.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  childName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  childPoints: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inviteCode: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
    letterSpacing: 4,
  },
});
