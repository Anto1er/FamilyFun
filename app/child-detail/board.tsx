import { useLocalSearchParams } from 'expo-router';
import { BoardCanvas } from '@/components/BoardCanvas';

export default function ChildBoardScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  if (!childId) return null;
  return <BoardCanvas childId={childId} />;
}
