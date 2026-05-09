import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { MissionRecurrence } from '@/types';
import { TouchableOpacity } from 'react-native';

export default function CreateMissionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const createMission = useMissionsStore((s) => s.createMission);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [recurrence, setRecurrence] = useState<MissionRecurrence>('one_time');
  const [loading, setLoading] = useState(false);

  const recurrenceOptions: { key: MissionRecurrence; label: string }[] = [
    { key: 'one_time', label: t('missions.oneTime') },
    { key: 'daily', label: t('missions.daily') },
    { key: 'weekly', label: t('missions.weekly') },
  ];

  const handleCreate = async () => {
    if (!title || !points || !profile?.family_id) return;
    setLoading(true);
    try {
      await createMission({
        family_id: profile.family_id,
        created_by: profile.id,
        title,
        description: description || null,
        points_reward: parseInt(points, 10),
        recurrence,
      });
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label={t('missions.missionTitle')}
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Faire les devoirs"
      />

      <Input
        label={t('missions.description')}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Input
        label={t('missions.pointsReward')}
        value={points}
        onChangeText={setPoints}
        keyboardType="number-pad"
        placeholder="10"
      />

      <Text style={styles.label}>{t('missions.recurrence')}</Text>
      <View style={styles.recurrenceRow}>
        {recurrenceOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.recurrenceChip,
              recurrence === option.key && styles.recurrenceChipActive,
            ]}
            onPress={() => setRecurrence(option.key)}
          >
            <Text
              style={[
                styles.recurrenceText,
                recurrence === option.key && styles.recurrenceTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={t('common.save')}
        onPress={handleCreate}
        loading={loading}
        disabled={!title || !points}
        style={styles.button}
      />
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
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  recurrenceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  recurrenceChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  recurrenceChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  recurrenceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  recurrenceTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    marginTop: SPACING.md,
  },
});
