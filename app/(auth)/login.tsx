import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Touchable } from '@/components/ui/Touchable';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [mode, _setMode] = useState<'parent' | 'child'>('parent');
  const setMode = (m: 'parent' | 'child') => {
    _setMode(m);
    setPassword('');
  };
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      let loginEmail = email;

      if (mode === 'child') {
        if (!displayName || !familyCode) return;
        // Look up the child's email via SECURITY DEFINER function (bypasses RLS)
        const { data, error: lookupError } = await supabase
          .rpc('get_child_email', { child_name: displayName, family_invite_code: familyCode });

        if (lookupError || !data) {
          Alert.alert('Erreur connexion', t('auth.loginError'));
          return;
        }
        loginEmail = data;
      } else {
        if (!email) return;
      }

      await signIn(loginEmail, password);
    } catch (error: any) {
      const msg = error?.message || error?.details || JSON.stringify(error);
      Alert.alert('Erreur connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  const canLogin = mode === 'parent' ? email && password : displayName && familyCode && password;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>FamilyQuest</Text>
        <Text style={styles.subtitle}>{t('auth.login')}</Text>

        {/* Toggle parent/child mode */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'parent' && styles.modeButtonActive]}
            onPress={() => setMode('parent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeText, mode === 'parent' && styles.modeTextActive]}>
              {t('roles.parent')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'child' && styles.modeButtonActive]}
            onPress={() => setMode('child')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeText, mode === 'child' && styles.modeTextActive]}>
              {t('roles.child')}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'parent' ? (
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : (
          <>
            <Input
              label={t('auth.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
            <Input
              label={t('family.inviteCode')}
              value={familyCode}
              onChangeText={setFamilyCode}
              autoCapitalize="characters"
            />
          </>
        )}

        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={t('auth.login')}
          onPress={handleLogin}
          loading={loading}
          disabled={!canLogin}
        />

        <Touchable
          style={styles.link}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>{t('auth.noAccount')}</Text>
        </Touchable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
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
  modeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modeTextActive: {
    color: '#FFF',
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
