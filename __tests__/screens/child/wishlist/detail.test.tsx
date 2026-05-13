import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import GiftDetailScreen from '@/app/(child)/wishlist/[id]';

const mockRedeemGift = jest.fn();
const mockDeleteGift = jest.fn();
const mockFetchProfile = jest.fn();
let mockGifts: any[];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'g-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      profile: { id: 'child-1', family_id: 'fam-1', points_balance: 100 },
      fetchProfile: mockFetchProfile,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: mockGifts,
      redeemGift: mockRedeemGift,
      deleteGift: mockDeleteGift,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGifts = [
    { id: 'g-1', title: 'Toy Car', child_id: 'child-1', status: 'approved', points_cost: 50, description: 'A nice toy' },
  ];
});

describe('GiftDetailScreen (child)', () => {
  it('renders gift details', () => {
    render(<GiftDetailScreen />);
    expect(screen.getByText('Toy Car')).toBeTruthy();
    expect(screen.getByText('A nice toy')).toBeTruthy();
    expect(screen.getByText('50 pts')).toBeTruthy();
  });

  it('renders redeem button for approved gifts', () => {
    render(<GiftDetailScreen />);
    expect(screen.getByText('gifts.redeem')).toBeTruthy();
  });

  it('displays current points balance', () => {
    render(<GiftDetailScreen />);
    expect(screen.getByText('100 pts')).toBeTruthy();
  });

  it('renders delete button', () => {
    render(<GiftDetailScreen />);
    expect(screen.getByText('gifts.deleteGift')).toBeTruthy();
  });

  it('shows confirmation alert on delete', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<GiftDetailScreen />);
    fireEvent.press(screen.getByText('gifts.deleteGift'));
    expect(alertSpy).toHaveBeenCalledWith(
      'gifts.deleteGift',
      'gifts.deleteGiftConfirm',
      expect.any(Array)
    );
  });

  it('renders pending approval status', () => {
    mockGifts[0] = { ...mockGifts[0], status: 'pending_approval', points_cost: null };
    render(<GiftDetailScreen />);
    expect(screen.getByText('gifts.pendingApproval')).toBeTruthy();
  });

  it('renders redeemed status', () => {
    mockGifts[0] = { ...mockGifts[0], status: 'redeemed' };
    render(<GiftDetailScreen />);
    expect(screen.getByText('gifts.redeemed')).toBeTruthy();
  });

  it('calls redeemGift when redeem button pressed', async () => {
    mockRedeemGift.mockResolvedValueOnce(undefined);
    mockFetchProfile.mockResolvedValueOnce(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<GiftDetailScreen />);
    fireEvent.press(screen.getByText('gifts.redeem'));

    await waitFor(() => {
      expect(mockRedeemGift).toHaveBeenCalledWith('g-1');
      expect(mockFetchProfile).toHaveBeenCalled();
    });
  });

  it('shows error view when gift not found', () => {
    mockGifts.length = 0;
    render(<GiftDetailScreen />);
    expect(screen.getByText('common.error')).toBeTruthy();
  });
});
