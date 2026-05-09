import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/lib/constants';
import { Transaction } from '@/types';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    if (!profile?.family_id) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setTransactions((data as Transaction[]) ?? []);
  };

  useEffect(() => {
    fetchTransactions();
  }, [profile?.family_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionRow}>
        <Ionicons
          name={item.amount > 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={24}
          color={item.amount > 0 ? COLORS.success : COLORS.error}
        />
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDesc}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount > 0 ? COLORS.success : COLORS.error },
          ]}
        >
          {item.amount > 0 ? '+' : ''}{item.amount} pts
        </Text>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderTransaction}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <EmptyState icon="time-outline" title={t('history.noTransactions')} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  transactionDesc: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
