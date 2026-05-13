import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import ParentAddGiftScreen from '@/app/(parent)/gifts/add';

const mockAddGift = jest.fn();
const mockBack = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = { addGift: mockAddGift };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      members: [
        { id: 'child-1', display_name: 'Alice', role: 'child' },
        { id: 'child-2', display_name: 'Bob', role: 'child' },
      ],
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ParentAddGiftScreen', () => {
  it('renders form fields', () => {
    render(<ParentAddGiftScreen />);
    expect(screen.getByText('gifts.selectChild')).toBeTruthy();
    expect(screen.getByText('gifts.giftTitle')).toBeTruthy();
    expect(screen.getByText('gifts.description')).toBeTruthy();
    expect(screen.getByText('gifts.pointsCost')).toBeTruthy();
  });

  it('renders child selection options', () => {
    render(<ParentAddGiftScreen />);
    expect(screen.getByText('gifts.wholeFamily')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('renders save button', () => {
    render(<ParentAddGiftScreen />);
    expect(screen.getByText('common.save')).toBeTruthy();
  });

  it('toggles child selection', () => {
    render(<ParentAddGiftScreen />);
    fireEvent.press(screen.getByText('Alice'));
    // Alice should now be selected - press again to deselect
    fireEvent.press(screen.getByText('Alice'));
    // Component should render without errors
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('toggles all family selection', () => {
    render(<ParentAddGiftScreen />);
    fireEvent.press(screen.getByText('gifts.wholeFamily'));
    // All family selected
    fireEvent.press(screen.getByText('gifts.wholeFamily'));
    // Toggled off
    expect(screen.getByText('gifts.wholeFamily')).toBeTruthy();
  });

  it('submits gift with child selected', async () => {
    mockAddGift.mockResolvedValue(undefined);
    render(<ParentAddGiftScreen />);

    // Select Alice
    fireEvent.press(screen.getByText('Alice'));

    // Fill form
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    // title, description, pointsCost, imageUrl, linkUrl
    fireEvent.changeText(inputs[0], 'New Toy');
    fireEvent.changeText(inputs[2], '50');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockAddGift).toHaveBeenCalledWith(
        expect.objectContaining({
          family_id: 'fam-1',
          child_id: 'child-1',
          title: 'New Toy',
          points_cost: 50,
          status: 'approved',
          approved_by: 'parent-1',
        })
      );
    });
  });
});
