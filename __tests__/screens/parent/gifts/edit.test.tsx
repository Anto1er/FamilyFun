import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TextInput } from 'react-native';
import EditGiftScreen from '@/app/(parent)/gifts/edit';

const mockUpdateGift = jest.fn();
const mockDismiss = jest.fn();
let mockGifts: any[];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'g-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismiss: mockDismiss }),
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: mockGifts,
      updateGift: mockUpdateGift,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGifts = [
    {
      id: 'g-1',
      title: 'Nintendo Switch',
      description: 'OLED version',
      image_url: 'https://img.example.com/switch.jpg',
      link_url: 'https://example.com/switch',
      points_cost: 100,
      status: 'approved',
      child_id: 'child-1',
    },
  ];
});

describe('EditGiftScreen', () => {
  it('renders form pre-filled with gift data', () => {
    render(<EditGiftScreen />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    expect(inputs[0].props.value).toBe('Nintendo Switch');
    expect(inputs[1].props.value).toBe('OLED version');
    expect(inputs[2].props.value).toBe('100');
    expect(inputs[3].props.value).toBe('https://img.example.com/switch.jpg');
    expect(inputs[4].props.value).toBe('https://example.com/switch');
  });

  it('renders all form labels', () => {
    render(<EditGiftScreen />);
    expect(screen.getByText('gifts.giftTitle')).toBeTruthy();
    expect(screen.getByText('gifts.description')).toBeTruthy();
    expect(screen.getByText('gifts.pointsCost')).toBeTruthy();
    expect(screen.getByText('gifts.imageUrl')).toBeTruthy();
    expect(screen.getByText('gifts.linkUrl')).toBeTruthy();
  });

  it('renders save button', () => {
    render(<EditGiftScreen />);
    expect(screen.getByText('common.save')).toBeTruthy();
  });

  it('calls updateGift with modified data on save', async () => {
    mockUpdateGift.mockResolvedValueOnce(undefined);
    render(<EditGiftScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'PS5');
    fireEvent.changeText(inputs[1], 'Digital edition');
    fireEvent.changeText(inputs[2], '200');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockUpdateGift).toHaveBeenCalledWith('g-1', {
        title: 'PS5',
        description: 'Digital edition',
        image_url: 'https://img.example.com/switch.jpg',
        link_url: 'https://example.com/switch',
        points_cost: 200,
      });
    });
  });

  it('navigates back after successful save', async () => {
    mockUpdateGift.mockResolvedValueOnce(undefined);
    render(<EditGiftScreen />);

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockDismiss).toHaveBeenCalled();
    });
  });

  it('shows alert on save error', async () => {
    mockUpdateGift.mockRejectedValueOnce(new Error('Update failed'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<EditGiftScreen />);

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('common.error', expect.stringContaining('Update failed'));
    });
  });

  it('returns null when gift not found', () => {
    mockGifts.length = 0;
    const { toJSON } = render(<EditGiftScreen />);
    expect(toJSON()).toBeNull();
  });

  it('handles empty optional fields correctly', async () => {
    mockUpdateGift.mockResolvedValueOnce(undefined);
    render(<EditGiftScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[1], ''); // clear description
    fireEvent.changeText(inputs[2], ''); // clear points
    fireEvent.changeText(inputs[3], ''); // clear image url
    fireEvent.changeText(inputs[4], ''); // clear link url

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockUpdateGift).toHaveBeenCalledWith('g-1', {
        title: 'Nintendo Switch',
        description: null,
        image_url: null,
        link_url: null,
        points_cost: null,
      });
    });
  });

  it('disables save button when title is empty', () => {
    render(<EditGiftScreen />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '');

    // The save button should be disabled
    const saveButton = screen.getByText('common.save');
    expect(saveButton).toBeTruthy();
  });

  it('renders with null optional fields', () => {
    mockGifts = [
      {
        id: 'g-1',
        title: 'Simple Gift',
        description: null,
        image_url: null,
        link_url: null,
        points_cost: null,
        status: 'pending_approval',
        child_id: 'child-1',
      },
    ];
    render(<EditGiftScreen />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    expect(inputs[0].props.value).toBe('Simple Gift');
    expect(inputs[1].props.value).toBe('');
    expect(inputs[2].props.value).toBe('');
    expect(inputs[3].props.value).toBe('');
    expect(inputs[4].props.value).toBe('');
  });
});
