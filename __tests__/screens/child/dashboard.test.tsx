import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ChildDashboard from '@/app/(child)/index';

const mockProfile = {
  id: 'child-1',
  display_name: 'Alice',
  role: 'child',
  family_id: 'fam-1',
  points_balance: 75,
};

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: mockProfile, fetchProfile: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: [
        { id: 'm-1', title: 'Clean room', status: 'active' },
        { id: 'm-2', title: 'Do homework', status: 'active' },
      ],
      fetchMissions: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = {
      gifts: [
        { id: 'g-1', status: 'approved', child_id: 'child-1' },
      ],
      fetchGifts: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

describe('ChildDashboard', () => {
  it('renders welcome message', () => {
    render(<ChildDashboard />);
    expect(screen.getByText(/dashboard.welcome/)).toBeTruthy();
  });

  it('displays points balance', () => {
    render(<ChildDashboard />);
    expect(screen.getByText('75')).toBeTruthy();
    expect(screen.getByText('dashboard.pointsBalance')).toBeTruthy();
  });

  it('displays mission count', () => {
    render(<ChildDashboard />);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('missions.available')).toBeTruthy();
  });

  it('displays gift count', () => {
    render(<ChildDashboard />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('gifts.title')).toBeTruthy();
  });
});
