import { renderHook } from '@testing-library/react-native';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/lib/supabase';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      profile: { id: 'user-1', family_id: 'fam-1' },
      fetchProfile: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = { fetchMembers: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = { fetchMissions: jest.fn(), fetchSubmissions: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = { fetchGifts: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

describe('useRealtime', () => {
  it('subscribes to supabase channel', () => {
    renderHook(() => useRealtime());
    expect(supabase.channel).toHaveBeenCalledWith('family:fam-1');
  });

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useRealtime());
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
