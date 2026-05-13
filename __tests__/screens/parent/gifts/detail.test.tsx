import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TextInput } from 'react-native';
import ParentGiftDetailScreen from '@/app/(parent)/gifts/[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'g-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

const mockApproveGift = jest.fn();
const mockRejectGift = jest.fn();
const mockDeleteGift = jest.fn();
let mockGifts: any[];

beforeEach(() => {
  jest.clearAllMocks();
  mockGifts = [
    { id: 'g-1', title: 'Nintendo Switch', child_id: 'child-1', status: 'pending_approval', description: 'OLED version', link_url: 'https://example.com', points_cost: null },
  ];
});

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: mockGifts,
      approveGift: mockApproveGift,
      rejectGift: mockRejectGift,
      deleteGift: mockDeleteGift,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      members: [{ id: 'child-1', display_name: 'Alice', role: 'child' }],
    };
    return selector ? selector(state) : state;
  },
}));

describe('ParentGiftDetailScreen', () => {
  it('renders gift details', () => {
    render(<ParentGiftDetailScreen />);
    expect(screen.getByText('Nintendo Switch')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('OLED version')).toBeTruthy();
  });

  it('renders approve/reject actions for pending gifts', () => {
    render(<ParentGiftDetailScreen />);
    expect(screen.getByText('gifts.approve')).toBeTruthy();
    expect(screen.getByText('gifts.reject')).toBeTruthy();
    expect(screen.getByText('gifts.setCost')).toBeTruthy();
  });

  it('renders delete button', () => {
    render(<ParentGiftDetailScreen />);
    expect(screen.getByText('gifts.deleteGift')).toBeTruthy();
  });

  it('shows confirmation alert on delete', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentGiftDetailScreen />);
    fireEvent.press(screen.getByText('gifts.deleteGift'));
    expect(alertSpy).toHaveBeenCalledWith(
      'gifts.deleteGift',
      'gifts.deleteGiftConfirm',
      expect.any(Array)
    );
  });

  it('renders approved card for approved gifts', () => {
    mockGifts[0] = { ...mockGifts[0], status: 'approved', points_cost: 100 };
    render(<ParentGiftDetailScreen />);
    expect(screen.getByText(/gifts.approved/)).toBeTruthy();
    expect(screen.getByText(/100 pts/)).toBeTruthy();
  });

  it('calls approveGift when approve button pressed with points', async () => {
    mockApproveGift.mockResolvedValueOnce(undefined);
    render(<ParentGiftDetailScreen />);

    // Enter points cost
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '50');
    fireEvent.press(screen.getByText('gifts.approve'));

    await waitFor(() => {
      expect(mockApproveGift).toHaveBeenCalledWith('g-1', 50, 'parent-1');
    });
  });

  it('calls rejectGift when reject button pressed', async () => {
    mockRejectGift.mockResolvedValueOnce(undefined);
    render(<ParentGiftDetailScreen />);
    fireEvent.press(screen.getByText('gifts.reject'));

    await waitFor(() => {
      expect(mockRejectGift).toHaveBeenCalledWith('g-1');
    });
  });
});
