import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TextInput } from 'react-native';
import LoginScreen from '@/app/(auth)/login';
import { supabase } from '@/lib/supabase';

const mockSignIn = jest.fn();
const mockPush = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { signIn: mockSignIn };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen', () => {
  it('renders the login form with title', () => {
    render(<LoginScreen />);
    expect(screen.getByText('FamilyQuest')).toBeTruthy();
    expect(screen.getAllByText('auth.login').length).toBeGreaterThanOrEqual(1);
  });

  it('renders parent mode by default with email field', () => {
    render(<LoginScreen />);
    expect(screen.getByText('auth.email')).toBeTruthy();
    expect(screen.getByText('auth.password')).toBeTruthy();
  });

  it('switches to child mode showing name and code fields', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('roles.child'));
    expect(screen.getByText('auth.displayName')).toBeTruthy();
    expect(screen.getByText('family.inviteCode')).toBeTruthy();
  });

  it('switches back to parent mode', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('roles.child'));
    fireEvent.press(screen.getByText('roles.parent'));
    expect(screen.getByText('auth.email')).toBeTruthy();
  });

  it('navigates to register screen', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('auth.noAccount'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
  });

  it('calls signIn with email and password in parent mode', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    render(<LoginScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'test@test.com');
    fireEvent.changeText(inputs[1], 'password123');

    const loginButtons = screen.getAllByText('auth.login');
    fireEvent.press(loginButtons[loginButtons.length - 1]);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('shows alert on login error', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<LoginScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'bad@test.com');
    fireEvent.changeText(inputs[1], 'wrong');

    const loginButtons = screen.getAllByText('auth.login');
    fireEvent.press(loginButtons[loginButtons.length - 1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('handles child login flow', async () => {
    // Use the global supabase mock's rpc
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: 'alice123@familyquest.local',
      error: null,
    });
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<LoginScreen />);

    // Switch to child mode
    fireEvent.press(screen.getByText('roles.child'));

    // Fill in child fields: displayName, familyCode, password
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Alice');
    fireEvent.changeText(inputs[1], 'ABC123');
    fireEvent.changeText(inputs[2], 'childpass');

    // Re-query button after state updates
    const loginButtons = screen.getAllByText('auth.login');
    fireEvent.press(loginButtons[loginButtons.length - 1]);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_child_email', {
        child_name: 'Alice',
        family_invite_code: 'ABC123',
      });
      expect(mockSignIn).toHaveBeenCalledWith('alice123@familyquest.local', 'childpass');
    });
  });
});
