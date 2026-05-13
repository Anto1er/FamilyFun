import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HistoryScreen from '@/app/(child)/history';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'child-1', family_id: 'fam-1' } };
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
  return {
    supabase: {
      from: jest.fn(() => mockChain),
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

const { __mockChain } = require('@/lib/supabase');

beforeEach(() => {
  jest.clearAllMocks();
  __mockChain.limit.mockResolvedValue({ data: [], error: null });
});

describe('HistoryScreen', () => {
  it('renders empty state when no transactions', async () => {
    render(<HistoryScreen />);
    await waitFor(() => {
      expect(screen.getByText('history.noTransactions')).toBeTruthy();
    });
  });

  it('renders transactions list with data', async () => {
    const transactions = [
      { id: 't-1', description: 'Clean room reward', amount: 10, created_at: '2025-01-15T10:00:00Z' },
      { id: 't-2', description: 'Gift redeemed', amount: -30, created_at: '2025-01-14T10:00:00Z' },
    ];
    __mockChain.limit.mockResolvedValueOnce({ data: transactions, error: null });

    render(<HistoryScreen />);
    await waitFor(() => {
      expect(screen.getByText('Clean room reward')).toBeTruthy();
      expect(screen.getByText('+10 pts')).toBeTruthy();
      expect(screen.getByText('Gift redeemed')).toBeTruthy();
      expect(screen.getByText('-30 pts')).toBeTruthy();
    });
  });
});
