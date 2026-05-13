import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import RoleSelectScreen from '@/app/(auth)/role-select';

const mockSetRole = jest.fn();
const mockReplace = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { setRole: mockSetRole };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RoleSelectScreen', () => {
  it('renders title and role cards', () => {
    render(<RoleSelectScreen />);
    expect(screen.getByText('roles.title')).toBeTruthy();
    expect(screen.getByText('roles.parent')).toBeTruthy();
    expect(screen.getByText('roles.child')).toBeTruthy();
    expect(screen.getByText('roles.parentDesc')).toBeTruthy();
    expect(screen.getByText('roles.childDesc')).toBeTruthy();
  });

  it('renders confirm button disabled initially', () => {
    render(<RoleSelectScreen />);
    expect(screen.getByText('common.confirm')).toBeTruthy();
  });

  it('calls setRole and navigates on confirm', async () => {
    mockSetRole.mockResolvedValueOnce(undefined);
    render(<RoleSelectScreen />);

    // Select parent role
    fireEvent.press(screen.getByText('roles.parentDesc'));
    fireEvent.press(screen.getByText('common.confirm'));

    await waitFor(() => {
      expect(mockSetRole).toHaveBeenCalledWith('parent');
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/family-setup');
    });
  });
});
