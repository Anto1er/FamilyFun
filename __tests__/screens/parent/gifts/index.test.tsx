import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ParentGiftsScreen from '@/app/(parent)/gifts/index';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: [
        { id: 'g-1', title: 'Nintendo Switch', child_id: 'child-1', status: 'pending_approval', points_cost: null },
        { id: 'g-2', title: 'Book', child_id: 'child-1', status: 'approved', points_cost: 50 },
      ],
      loading: false,
      fetchGifts: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      members: [
        { id: 'child-1', display_name: 'Alice', role: 'child' },
      ],
    };
    return selector ? selector(state) : state;
  },
}));

describe('ParentGiftsScreen', () => {
  it('renders gifts list', () => {
    render(<ParentGiftsScreen />);
    expect(screen.getByText('Nintendo Switch')).toBeTruthy();
    expect(screen.getByText('Book')).toBeTruthy();
  });

  it('shows pending approval badge', () => {
    render(<ParentGiftsScreen />);
    expect(screen.getByText('gifts.pendingApproval')).toBeTruthy();
  });

  it('shows child name for each gift', () => {
    render(<ParentGiftsScreen />);
    expect(screen.getAllByText('Alice')).toBeTruthy();
  });

  it('shows points cost when available', () => {
    render(<ParentGiftsScreen />);
    expect(screen.getByText('50 pts')).toBeTruthy();
  });
});
