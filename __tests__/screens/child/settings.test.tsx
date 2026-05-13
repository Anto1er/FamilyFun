import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChildSettingsScreen from '@/app/(child)/settings';

const mockSignOut = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      profile: { id: 'child-1', display_name: 'Alice', email: 'alice@familyquest.local' },
      signOut: mockSignOut,
      updateProfile: mockUpdateProfile,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ChildSettingsScreen', () => {
  it('renders profile info', () => {
    render(<ChildSettingsScreen />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('alice@familyquest.local')).toBeTruthy();
  });

  it('renders language toggle', () => {
    render(<ChildSettingsScreen />);
    expect(screen.getByText('settings.language')).toBeTruthy();
  });

  it('renders logout button', () => {
    render(<ChildSettingsScreen />);
    expect(screen.getByText('auth.logout')).toBeTruthy();
  });

  it('shows confirmation on logout', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ChildSettingsScreen />);
    fireEvent.press(screen.getByText('auth.logout'));
    expect(alertSpy).toHaveBeenCalledWith('auth.logout', '', expect.any(Array));
  });

  it('calls toggleLanguage when language button pressed', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    render(<ChildSettingsScreen />);

    // The button text depends on current language - in test it's 'en'
    // so button shows settings.french (switch to French)
    const langButton = screen.getByText('settings.french');
    fireEvent.press(langButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ locale: 'fr' });
    });
  });

  it('calls signOut on logout confirmation', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ChildSettingsScreen />);
    fireEvent.press(screen.getByText('auth.logout'));

    // Get the confirm callback from the Alert
    const alertCalls = alertSpy.mock.calls;
    const buttons = alertCalls[0][2] as any[];
    const confirmButton = buttons.find((b: any) => b.style === 'destructive');
    confirmButton.onPress();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
