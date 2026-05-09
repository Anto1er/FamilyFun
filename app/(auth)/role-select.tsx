import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { UserRole } from '@/types';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      await setRole(selectedRole);
      router.replace('/(auth)/family-setup');
    } catch {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('roles.title')}</Text>

      <TouchableOpacity
        style={[styles.roleCard, selectedRole === 'parent' && styles.roleCardSelected]}
        onPress={() => setSelectedRole('parent')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="people"
          size={48}
          color={selectedRole === 'parent' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.roleName, selectedRole === 'parent' && styles.roleNameSelected]}>
          {t('roles.parent')}
        </Text>
        <Text style={styles.roleDesc}>{t('roles.parentDesc')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleCard, selectedRole === 'child' && styles.roleCardSelected]}
        onPress={() => setSelectedRole('child')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="happy"
          size={48}
          color={selectedRole === 'child' ? COLORS.secondary : COLORS.textSecondary}
        />
        <Text style={[styles.roleName, selectedRole === 'child' && styles.roleNameSelected]}>
          {t('roles.child')}
        </Text>
        <Text style={styles.roleDesc}>{t('roles.childDesc')}</Text>
      </TouchableOpacity>

      <Button
        title={t('common.confirm')}
        onPress={handleContinue}
        loading={loading}
        disabled={!selectedRole}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0EEFF',
  },
  roleName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  roleNameSelected: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.lg,
  },
});
