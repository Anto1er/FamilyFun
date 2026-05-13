import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import ParentNotificationsScreen from '@/app/(parent)/notifications';

const mockFrom = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/lib/supabase', () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  const from = jest.fn(() => mockChain);
  return {
    supabase: {
      from,
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        getSession: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        setSession: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
      channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
      removeChannel: jest.fn(),
    },
    skipAuthStateChange: false,
    setSkipAuthStateChange: jest.fn(),
    __mockChain: mockChain,
  };
});

const { supabase, __mockChain } = require('@/lib/supabase');

beforeEach(() => {
  jest.clearAllMocks();
  __mockChain.limit.mockResolvedValue({ data: [], error: null });
});

describe('ParentNotificationsScreen', () => {
  it('renders empty state when no notifications', async () => {
    render(<ParentNotificationsScreen />);
    await waitFor(() => {
      expect(screen.getByText('notifications.noNotifications')).toBeTruthy();
    });
  });

  it('renders notifications list with data', async () => {
    const notifications = [
      { id: 'n-1', title: 'Mission done', body: 'Alice did it', read: false, created_at: '2025-01-15T10:00:00Z' },
      { id: 'n-2', title: 'Gift request', body: 'Bob wants toy', read: true, created_at: '2025-01-14T10:00:00Z' },
    ];
    __mockChain.limit.mockResolvedValueOnce({ data: notifications, error: null });

    render(<ParentNotificationsScreen />);
    await waitFor(() => {
      expect(screen.getByText('Mission done')).toBeTruthy();
      expect(screen.getByText('Alice did it')).toBeTruthy();
      expect(screen.getByText('Gift request')).toBeTruthy();
    });
  });

  it('shows mark all read button when unread notifications exist', async () => {
    const notifications = [
      { id: 'n-1', title: 'Unread', body: 'Content', read: false, created_at: '2025-01-15T10:00:00Z' },
    ];
    __mockChain.limit.mockResolvedValueOnce({ data: notifications, error: null });

    render(<ParentNotificationsScreen />);
    await waitFor(() => {
      expect(screen.getByText('notifications.markAllRead')).toBeTruthy();
    });
  });
});
