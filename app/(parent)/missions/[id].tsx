import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { useFamilyStore } from '@/stores/familyStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Touchable } from '@/components/ui/Touchable';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';
import { MissionSubmission } from '@/types';

export default function ParentMissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { missions, submissions, fetchSubmissions, validateSubmission, archiveMission } = useMissionsStore();
  const { members } = useFamilyStore();
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const mission = missions.find((m) => m.id === id);
  const missionSubmissions = submissions.filter((s) => s.mission_id === id);
  const pendingSubmissions = missionSubmissions.filter((s) => s.status === 'pending');

  const getChildName = (childId: string) =>
    members.find((m) => m.id === childId)?.display_name ?? '?';

  const handleValidate = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    try {
      await validateSubmission(submissionId, status, profile.id);
      if (profile.family_id) await fetchSubmissions(profile.family_id);
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleArchive = () => {
    Alert.alert(t('common.confirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          if (mission) await archiveMission(mission.id);
        },
      },
    ]);
  };

  if (!mission) return null;

  const renderSubmission = ({ item }: { item: MissionSubmission }) => (
    <Card style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <Text style={styles.childName}>{getChildName(item.child_id)}</Text>
        <Text style={styles.submissionDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      {item.note && <Text style={styles.note}>{item.note}</Text>}
      {item.status === 'pending' ? (
        <View style={styles.actions}>
          <Button
            title={t('missions.approved')}
            onPress={() => handleValidate(item.id, 'approved')}
            size="sm"
            style={styles.approveBtn}
          />
          <Button
            title={t('missions.rejected')}
            onPress={() => handleValidate(item.id, 'rejected')}
            variant="danger"
            size="sm"
          />
        </View>
      ) : (
        <Text
          style={[
            styles.statusText,
            { color: item.status === 'approved' ? COLORS.success : COLORS.error },
          ]}
        >
          {item.status === 'approved' ? t('missions.approved') : t('missions.rejected')}
        </Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            {mission.description && <Text style={styles.description}>{mission.description}</Text>}
            <Text style={styles.points}>+{mission.points_reward} pts</Text>
          </View>
          <Touchable onPress={() => router.push(`/(parent)/missions/edit?id=${mission.id}`)}>
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </Touchable>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>
        {t('missions.pendingSubmissions')} ({pendingSubmissions.length})
      </Text>

      <FlatList
        data={missionSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={renderSubmission}
        contentContainerStyle={styles.list}
      />

      <Button
        title={t('common.delete')}
        onPress={handleArchive}
        variant="outline"
        style={styles.archiveBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  headerCard: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  missionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  points: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.warning,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  list: {
    paddingBottom: SPACING.lg,
  },
  submissionCard: {
    marginBottom: SPACING.md,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  childName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  submissionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  note: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  approveBtn: {
    flex: 1,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  archiveBtn: {
    marginTop: SPACING.md,
  },
});
