import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import RegisterScreen from '@/app/(auth)/register';

const mockSignUp = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { signUp: mockSignUp };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RegisterScreen', () => {
  it('renders role selection step initially', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('FamilyQuest')).toBeTruthy();
    expect(screen.getByText('roles.title')).toBeTruthy();
    expect(screen.getByText('roles.parent')).toBeTruthy();
    expect(screen.getByText('roles.child')).toBeTruthy();
  });

  it('shows parent registration form after selecting parent', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByText('roles.parentDesc'));
    expect(screen.getByText('auth.displayName')).toBeTruthy();
    expect(screen.getByText('auth.email')).toBeTruthy();
    expect(screen.getByText('auth.password')).toBeTruthy();
  });

  it('shows child registration form without email after selecting child', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByText('roles.childDesc'));
    expect(screen.getByText('auth.displayName')).toBeTruthy();
    expect(screen.queryByText('auth.email')).toBeNull();
    expect(screen.getByText('auth.password')).toBeTruthy();
  });

  it('has a back button to return to role selection', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByText('roles.parentDesc'));
    fireEvent.press(screen.getByText('common.back'));
    expect(screen.getByText('roles.title')).toBeTruthy();
  });

  it('navigates to login screen', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByText('auth.hasAccount'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('calls signUp for parent registration', async () => {
    mockSignUp.mockResolvedValueOnce(undefined);
    render(<RegisterScreen />);

    // Select parent role
    fireEvent.press(screen.getByText('roles.parentDesc'));

    // In parent registration form: displayName (0), email (1), password (2)
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'John');
    fireEvent.changeText(inputs[1], 'john@test.com');
    fireEvent.changeText(inputs[2], 'password123');

    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'john@test.com',
        'password123',
        'John',
        'parent'
      );
    });
  });
});
