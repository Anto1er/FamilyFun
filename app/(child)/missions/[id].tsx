import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { missions, submissions, submitMission } = useMissionsStore();

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const mission = missions.find((m) => m.id === id);
  const mySubmissions = submissions.filter(
    (s) => s.mission_id === id && s.child_id === profile?.id
  );
  const hasPendingSubmission = mySubmissions.some((s) => s.status === 'pending');

  if (!mission) {
    return (
      <View style={styles.container}>
        <Text>{t('common.error')}</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!profile?.family_id) return;
    setLoading(true);
    try {
      await submitMission(mission.id, profile.id, profile.family_id, note || undefined);
      Alert.alert(t('missions.submit'), t('missions.submitted'));
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
        <View style={styles.header}>
          <Ionicons name="rocket" size={40} color={COLORS.primary} />
          <Text style={styles.points}>+{mission.points_reward} pts</Text>
        </View>

        <Text style={styles.title}>{mission.title}</Text>
        {mission.description && (
          <Text style={styles.description}>{mission.description}</Text>
        )}

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {t(`missions.${mission.recurrence === 'one_time' ? 'oneTime' : mission.recurrence}`)}
          </Text>
        </View>
      </Card>

      {hasPendingSubmission ? (
        <Card style={styles.pendingCard}>
          <Ionicons name="hourglass" size={24} color={COLORS.warning} />
          <Text style={styles.pendingText}>{t('missions.submitted')}</Text>
        </Card>
      ) : (
        <View style={styles.submitSection}>
          <Input
            label={t('missions.note')}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            placeholder="..."
          />
          <Button
            title={t('missions.submit')}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
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
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  points: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.warning,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  meta: {
    marginTop: SPACING.md,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  submitSection: {
    marginTop: SPACING.md,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#FFF9E6',
  },
  pendingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.warning,
  },
});
