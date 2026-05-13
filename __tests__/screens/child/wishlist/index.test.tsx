import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ChildWishlistScreen from '@/app/(child)/wishlist/index';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'child-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: [
        { id: 'g-1', title: 'Toy Car', child_id: 'child-1', status: 'approved', points_cost: 30 },
        { id: 'g-2', title: 'Book', child_id: 'child-1', status: 'pending_approval', points_cost: null },
        { id: 'g-3', title: 'Other child gift', child_id: 'child-2', status: 'approved', points_cost: 50 },
      ],
      loading: false,
      fetchGifts: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

describe('ChildWishlistScreen', () => {
  it('renders only the current childs gifts', () => {
    render(<ChildWishlistScreen />);
    expect(screen.getByText('Toy Car')).toBeTruthy();
    expect(screen.getByText('Book')).toBeTruthy();
    expect(screen.queryByText('Other child gift')).toBeNull();
  });

  it('shows status badges', () => {
    render(<ChildWishlistScreen />);
    expect(screen.getByText('gifts.approved')).toBeTruthy();
    expect(screen.getByText('gifts.pendingApproval')).toBeTruthy();
  });

  it('shows points cost when available', () => {
    render(<ChildWishlistScreen />);
    expect(screen.getByText('30 pts')).toBeTruthy();
  });
});
