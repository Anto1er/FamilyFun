import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/lib/constants';

export default function ParentLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        tabBarStyle: { backgroundColor: COLORS.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard.parentTitle'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: t('family.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gifts/index"
        options={{
          title: t('gifts.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      {/* Hide sub-routes from tabs */}
      <Tabs.Screen name="missions/index" options={{ href: null }} />
      <Tabs.Screen name="missions/create" options={{ href: null }} />
      <Tabs.Screen name="missions/edit" options={{ href: null }} />
      <Tabs.Screen name="missions/[id]" options={{ href: null }} />
      <Tabs.Screen name="gifts/add" options={{ href: null }} />
      <Tabs.Screen name="gifts/[id]" options={{ href: null }} />
      <Tabs.Screen name="children/[id]" options={{ href: null }} />
      <Tabs.Screen name="children/add" options={{ href: null }} />
    </Tabs>
  );
}
