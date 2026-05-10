import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/lib/constants';

export default function ChildDetailLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        title: t('family.childDetail'),
      }}
    />
  );
}
