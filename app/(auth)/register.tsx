import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { UserRole } from '@/types';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isChild = selectedRole === 'child';

  const handleRegister = async () => {
    if (!selectedRole || !displayName || !password) return;
    if (!isChild && !email) return;

    setLoading(true);
    try {
      // For children, generate a fake email (strip accents for valid email)
      const safeName = displayName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const effectiveEmail = isChild
        ? `${safeName}${Date.now()}@familyquest.local`
        : email;

      await signUp(effectiveEmail, password, displayName, selectedRole);
      router.replace('/(auth)/family-setup');
    } catch (error: any) {
      const msg = error?.message || error?.details || JSON.stringify(error);
      Alert.alert('Erreur inscription', msg);
    } finally {
      setLoading(false);
    }
  };

  const canRegister = selectedRole && displayName && password && (isChild || email);

  // Step 1: Choose role
  if (!selectedRole) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>FamilyQuest</Text>
          <Text style={styles.subtitle}>{t('roles.title')}</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setSelectedRole('parent')}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={48} color={COLORS.primary} />
            <Text style={[styles.roleName, { color: COLORS.primary }]}>{t('roles.parent')}</Text>
            <Text style={styles.roleDesc}>{t('roles.parentDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setSelectedRole('child')}
            activeOpacity={0.7}
          >
            <Ionicons name="happy" size={48} color={COLORS.secondary} />
            <Text style={[styles.roleName, { color: COLORS.secondary }]}>{t('roles.child')}</Text>
            <Text style={styles.roleDesc}>{t('roles.childDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.linkText}>{t('auth.hasAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Registration form (adapts based on role)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>FamilyQuest</Text>
        <Text style={styles.subtitle}>
          {t('auth.register')} - {isChild ? t('roles.child') : t('roles.parent')}
        </Text>

        <Input
          label={t('auth.displayName')}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />

        {!isChild && (
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={t('auth.register')}
          onPress={handleRegister}
          loading={loading}
          disabled={!canRegister}
        />

        <TouchableOpacity
          style={styles.link}
          onPress={() => setSelectedRole(null)}
        >
          <Text style={styles.linkText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
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
  roleName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  roleDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  link: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
