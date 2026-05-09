import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyStore } from '@/stores/familyStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, SPACING, FONT_SIZES } from '@/lib/constants';
import { Transaction } from '@/types';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { members, removeChild, updateChildPassword } = useFamilyStore();
  const profile = useAuthStore((s) => s.profile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [removing, setRemoving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const child = members.find((m) => m.id === id);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('child_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions((data as Transaction[]) ?? []);
    };
    fetchTransactions();
  }, [id]);

  if (!child) return null;

  const handleRemoveChild = () => {
    Alert.alert(
      t('common.confirm'),
      `${t('family.removeChildConfirm')} ${child.display_name} ?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await removeChild(child.id, profile?.family_id ?? '');
              router.back();
            } catch (error: any) {
              Alert.alert(t('common.error'), error?.message);
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
      await updateChildPassword(child.id, newPassword);
      setNewPassword('');
      Alert.alert(t('family.passwordChanged'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.message ?? String(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionRow}>
        <Ionicons
          name={item.amount > 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={20}
          color={item.amount > 0 ? COLORS.success : COLORS.error}
        />
        <Text style={styles.transactionDesc}>{item.description}</Text>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount > 0 ? COLORS.success : COLORS.error },
          ]}
        >
          {item.amount > 0 ? '+' : ''}{item.amount}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.avatar}>
          <Ionicons name="happy" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>{child.display_name}</Text>
        <Text style={styles.points}>{child.points_balance} pts</Text>
      </Card>

      <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
      />

      <Text style={styles.sectionTitle}>{t('family.changePassword')}</Text>
      <Card style={styles.passwordCard}>
        <Input
          label={t('family.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Button
          title={t('family.changePassword')}
          onPress={handleChangePassword}
          loading={changingPassword}
          disabled={newPassword.length < 6}
          style={styles.passwordButton}
        />
      </Card>

      <Button
        title={t('family.removeChild')}
        onPress={handleRemoveChild}
        loading={removing}
        variant="danger"
        style={styles.removeButton}
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
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  points: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: SPACING.xs,
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
  transactionCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  transactionDesc: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  removeButton: {
    marginTop: SPACING.md,
  },
  passwordCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  passwordButton: {
    marginTop: SPACING.sm,
  },
});
