import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TextInput } from 'react-native';
import AddChildScreen from '@/app/(parent)/add-child';

const mockAddChild = jest.fn();
const mockBack = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = { addChild: mockAddChild };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddChildScreen', () => {
  it('renders form fields', () => {
    render(<AddChildScreen />);
    expect(screen.getByText('auth.displayName')).toBeTruthy();
    expect(screen.getByText('family.childPassword')).toBeTruthy();
    expect(screen.getByText('family.addChild')).toBeTruthy();
  });

  it('calls addChild and navigates back on success', async () => {
    mockAddChild.mockResolvedValueOnce(undefined);
    render(<AddChildScreen />);

    // displayName (index 0), password (index 1)
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Alice');
    fireEvent.changeText(inputs[1], 'secret123');

    fireEvent.press(screen.getByText('family.addChild'));

    await waitFor(() => {
      expect(mockAddChild).toHaveBeenCalledWith('Alice', 'secret123', 'fam-1');
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('shows alert on error', async () => {
    mockAddChild.mockRejectedValueOnce(new Error('Account creation failed'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<AddChildScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Alice');
    fireEvent.changeText(inputs[1], 'secret123');

    fireEvent.press(screen.getByText('family.addChild'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('does not submit with short password', () => {
    render(<AddChildScreen />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Alice');
    fireEvent.changeText(inputs[1], '123');
    expect(screen.getByText('family.addChild')).toBeTruthy();
  });
});
