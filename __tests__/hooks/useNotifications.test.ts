import { renderHook } from '@testing-library/react-native';
import { useNotifications } from '@/hooks/useNotifications';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'user-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('useNotifications', () => {
  it('renders without crashing', () => {
    const { result } = renderHook(() => useNotifications());
    // Hook returns void, just verify it doesn't crash
    expect(result.current).toBeUndefined();
  });
});
