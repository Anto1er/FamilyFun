import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { session, profile } = useAuthStore();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.family_id) {
    return <Redirect href="/(auth)/family-setup" />;
  }

  if (profile.role === 'parent') {
    return <Redirect href="/(parent)" />;
  }

  return <Redirect href="/(child)" />;
}
