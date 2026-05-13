import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import AddGiftScreen from '@/app/(child)/wishlist/add';

const mockAddGift = jest.fn();
const mockBack = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'child-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = { addGift: mockAddGift };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddGiftScreen (child)', () => {
  it('renders form fields', () => {
    render(<AddGiftScreen />);
    expect(screen.getByText('gifts.giftTitle')).toBeTruthy();
    expect(screen.getByText('gifts.description')).toBeTruthy();
    expect(screen.getByText('gifts.imageUrl')).toBeTruthy();
    expect(screen.getByText('gifts.linkUrl')).toBeTruthy();
    expect(screen.getByText('common.save')).toBeTruthy();
  });

  it('calls addGift and navigates back', async () => {
    mockAddGift.mockResolvedValueOnce(undefined);
    render(<AddGiftScreen />);

    // Form inputs: giftTitle (0), description (1), imageUrl (2), linkUrl (3)
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Nintendo Switch');
    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockAddGift).toHaveBeenCalledWith({
        family_id: 'fam-1',
        child_id: 'child-1',
        title: 'Nintendo Switch',
        description: undefined,
        image_url: undefined,
        link_url: undefined,
      });
    });
  });
});
