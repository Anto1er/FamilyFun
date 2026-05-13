import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ParentMissionsScreen from '@/app/(parent)/missions/index';

const mockMissionsData = [
  { id: 'm-1', title: 'Clean room', status: 'active', points_reward: 10, family_id: 'fam-1' },
  { id: 'm-2', title: 'Do homework', status: 'active', points_reward: 20, family_id: 'fam-1' },
];
const mockSubmissionsData = [
  { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'pending', family_id: 'fam-1' },
  { id: 's-2', mission_id: 'm-2', child_id: 'child-1', status: 'claimed', family_id: 'fam-1' },
];

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

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

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      members: [
        { id: 'child-1', display_name: 'Alice', role: 'child' },
      ],
    };
    return selector ? selector(state) : state;
  },
}));

describe('ParentMissionsScreen', () => {
  it('renders missions list', () => {
    render(<ParentMissionsScreen />);
    expect(screen.getByText('Clean room')).toBeTruthy();
    expect(screen.getByText('Do homework')).toBeTruthy();
  });

  it('displays points for each mission', () => {
    render(<ParentMissionsScreen />);
    expect(screen.getByText('+10 pts')).toBeTruthy();
    expect(screen.getByText('+20 pts')).toBeTruthy();
  });

  it('shows pending badge for missions with pending submissions', () => {
    render(<ParentMissionsScreen />);
    // m-1 has 1 pending submission, should show badge with "1"
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('shows claimed by text', () => {
    render(<ParentMissionsScreen />);
    expect(screen.getByText(/missions.claimedBy/)).toBeTruthy();
  });
});

describe('ParentMissionsScreen - empty', () => {
  it('shows empty state when no missions', () => {
    const origMissions = [...mockMissionsData];
    const origSubmissions = [...mockSubmissionsData];
    mockMissionsData.length = 0;
    mockSubmissionsData.length = 0;

    render(<ParentMissionsScreen />);
    expect(screen.getByText('missions.noMissions')).toBeTruthy();

    mockMissionsData.push(...origMissions);
    mockSubmissionsData.push(...origSubmissions);
  });
});
