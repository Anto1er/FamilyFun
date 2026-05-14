import { BoardCanvas } from '@/components/BoardCanvas';
import { useAuthStore } from '@/stores/authStore';

export default function BoardScreen() {
  const profile = useAuthStore((s) => s.profile);
  if (!profile) return null;
  return <BoardCanvas childId={profile.id} />;
}
