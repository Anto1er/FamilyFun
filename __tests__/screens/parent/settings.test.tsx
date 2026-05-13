import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ParentSettingsScreen from '@/app/(parent)/settings';

const mockSignOut = jest.fn();
const mockUpdateProfile = jest.fn();
const mockProfile = {
  id: 'parent-1',
  display_name: 'Papa',
  email: 'papa@test.com',
  role: 'parent',
};
const mockFamily = { id: 'fam-1', name: 'Dupont', invite_code: 'ABC123' };

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: mockProfile, signOut: mockSignOut, updateProfile: mockUpdateProfile };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = { family: mockFamily };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ParentSettingsScreen', () => {
  it('renders profile info', () => {
    render(<ParentSettingsScreen />);
    expect(screen.getByText('Papa')).toBeTruthy();
    expect(screen.getByText('papa@test.com')).toBeTruthy();
  });

  it('renders family code', () => {
    render(<ParentSettingsScreen />);
    expect(screen.getByText('ABC123')).toBeTruthy();
  });

  it('renders language toggle', () => {
    render(<ParentSettingsScreen />);
    expect(screen.getByText('settings.language')).toBeTruthy();
  });

  it('renders logout button', () => {
    render(<ParentSettingsScreen />);
    expect(screen.getByText('auth.logout')).toBeTruthy();
  });

  it('shows confirmation alert on logout', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentSettingsScreen />);
    fireEvent.press(screen.getByText('auth.logout'));
    expect(alertSpy).toHaveBeenCalledWith(
      'auth.logout',
      '',
      expect.any(Array)
    );
  });

  it('calls toggleLanguage when language button pressed', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    render(<ParentSettingsScreen />);

    const langButton = screen.getByText('settings.french');
    fireEvent.press(langButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ locale: 'fr' });
    });
  });

  it('calls signOut on logout confirmation', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentSettingsScreen />);
    fireEvent.press(screen.getByText('auth.logout'));

    const alertCalls = alertSpy.mock.calls;
    const buttons = alertCalls[0][2] as any[];
    const confirmButton = buttons.find((b: any) => b.style === 'destructive');
    confirmButton.onPress();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
