import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ChildMissionsScreen from '@/app/(child)/missions/index';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'child-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

const mockMissionsData = [
  { id: 'm-1', title: 'Clean room', description: 'Tidy up', points_reward: 10, recurrence: 'one_time', status: 'active' },
  { id: 'm-2', title: 'Do homework', description: null, points_reward: 20, recurrence: 'daily', status: 'active' },
];
const mockSubmissionsData = [
  { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'claimed', family_id: 'fam-1' },
];

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: mockMissionsData,
      submissions: mockSubmissionsData,
      loading: false,
      fetchMissions: jest.fn(),
      fetchSubmissions: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

describe('ChildMissionsScreen', () => {
  it('renders missions list', () => {
    render(<ChildMissionsScreen />);
    expect(screen.getByText('Clean room')).toBeTruthy();
    expect(screen.getByText('Do homework')).toBeTruthy();
  });

  it('displays points reward', () => {
    render(<ChildMissionsScreen />);
    expect(screen.getByText('+10')).toBeTruthy();
    expect(screen.getByText('+20')).toBeTruthy();
  });

  it('shows claimed badge for claimed missions', () => {
    render(<ChildMissionsScreen />);
    expect(screen.getByText('missions.claimed')).toBeTruthy();
  });

  it('shows mission description', () => {
    render(<ChildMissionsScreen />);
    expect(screen.getByText('Tidy up')).toBeTruthy();
  });

  it('shows recurrence badges', () => {
    render(<ChildMissionsScreen />);
    expect(screen.getByText('missions.oneTime')).toBeTruthy();
    expect(screen.getByText('missions.daily')).toBeTruthy();
  });
});

describe('ChildMissionsScreen - empty', () => {
  it('shows empty state when no missions', () => {
    const origMissions = [...mockMissionsData];
    const origSubmissions = [...mockSubmissionsData];
    mockMissionsData.length = 0;
    mockSubmissionsData.length = 0;

    render(<ChildMissionsScreen />);
    expect(screen.getByText('missions.noMissions')).toBeTruthy();

    mockMissionsData.push(...origMissions);
    mockSubmissionsData.push(...origSubmissions);
  });
});
