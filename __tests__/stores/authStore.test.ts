import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    session: null,
    profile: null,
    loading: true,
    initialized: false,
  });
  jest.clearAllMocks();
});

describe('authStore', () => {
  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.loading).toBe(true);
      expect(state.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('initializes with session and fetches profile', async () => {
      const mockSession = {
        user: { id: 'user-1' },
        access_token: 'token',
        refresh_token: 'refresh',
      };
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
      });
      // Mock fetchProfile chain
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'user-1', display_name: 'Test', role: 'parent' },
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(profileChain);

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
      expect(state.initialized).toBe(true);
      expect(state.profile).toEqual({ id: 'user-1', display_name: 'Test', role: 'parent' });
    });

    it('initializes without session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
      });

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.initialized).toBe(true);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('calls supabase signInWithPassword', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: null });
      await useAuthStore.getState().signIn('test@test.com', 'password');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('throws on auth error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        error: new Error('Invalid credentials'),
      });
      await expect(useAuthStore.getState().signIn('bad@test.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('signUp', () => {
    it('calls supabase signUp and inserts profile', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'test-id', email: 'test@test.com', display_name: 'Test', role: 'parent' }],
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-id', identities: [{}] } },
        error: null,
      });

      await useAuthStore.getState().signUp('test@test.com', 'password', 'Test', 'parent');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('throws if signUp returns auth error', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Email taken'),
      });
      await expect(
        useAuthStore.getState().signUp('taken@test.com', 'pass', 'Test')
      ).rejects.toThrow('Email taken');
    });

    it('throws if user has no identities (duplicate email)', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'dup-id', identities: [] } },
        error: null,
      });
      await expect(
        useAuthStore.getState().signUp('dup@test.com', 'pass', 'Dup')
      ).rejects.toThrow('Cette adresse email est déjà utilisée.');
    });

    it('throws if profile insert fails', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-id', identities: [{}] } },
        error: null,
      });
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Profile insert failed'),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      await expect(
        useAuthStore.getState().signUp('test@test.com', 'pass', 'Test', 'parent')
      ).rejects.toThrow('Profile insert failed');
    });

    it('handles data.user being null (email confirmation required)', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      // Should not throw, just log warning
      await useAuthStore.getState().signUp('test@test.com', 'pass', 'Test');
      // Profile insert should not be called
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('clears session and profile on signOut', async () => {
      useAuthStore.setState({
        session: { user: { id: 'test' } } as any,
        profile: { id: 'test', display_name: 'Test' } as any,
      });
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

      await useAuthStore.getState().signOut();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.profile).toBeNull();
    });

    it('throws if signOut fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: new Error('Sign out failed'),
      });
      await expect(useAuthStore.getState().signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('setRole', () => {
    it('throws if not authenticated', async () => {
      useAuthStore.setState({ session: null });
      await expect(useAuthStore.getState().setRole('parent')).rejects.toThrow('Not authenticated');
    });

    it('updates role and fetches profile on success', async () => {
      const mockSession = { user: { id: 'user-1' } };
      useAuthStore.setState({ session: mockSession as any });

      // First call: update role, second call: fetchProfile
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'user-1', display_name: 'Test', role: 'parent' },
          error: null,
        }),
      };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(profileChain);

      await useAuthStore.getState().setRole('parent');
      expect(updateChain.update).toHaveBeenCalledWith({ role: 'parent' });
      expect(useAuthStore.getState().profile).toEqual({
        id: 'user-1', display_name: 'Test', role: 'parent',
      });
    });
  });

  describe('fetchProfile', () => {
    it('does nothing if no session', async () => {
      useAuthStore.setState({ session: null });
      await useAuthStore.getState().fetchProfile();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('fetches and sets profile when session exists', async () => {
      const mockSession = { user: { id: 'user-1' } };
      useAuthStore.setState({ session: mockSession as any });

      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'user-1', display_name: 'Test', role: 'child', family_id: 'fam-1' },
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(profileChain);

      await useAuthStore.getState().fetchProfile();
      expect(useAuthStore.getState().profile).toEqual({
        id: 'user-1', display_name: 'Test', role: 'child', family_id: 'fam-1',
      });
    });
  });

  describe('updateProfile', () => {
    it('throws if not authenticated', async () => {
      useAuthStore.setState({ session: null });
      await expect(
        useAuthStore.getState().updateProfile({ display_name: 'New' } as any)
      ).rejects.toThrow('Not authenticated');
    });

    it('updates profile and re-fetches', async () => {
      const mockSession = { user: { id: 'user-1' } };
      useAuthStore.setState({ session: mockSession as any });

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'user-1', display_name: 'New Name', role: 'parent' },
          error: null,
        }),
      };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(profileChain);

      await useAuthStore.getState().updateProfile({ display_name: 'New Name' } as any);
      expect(updateChain.update).toHaveBeenCalledWith({ display_name: 'New Name' });
      expect(useAuthStore.getState().profile).toEqual({
        id: 'user-1', display_name: 'New Name', role: 'parent',
      });
    });
  });
});
