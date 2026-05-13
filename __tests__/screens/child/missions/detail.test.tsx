import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import MissionDetailScreen from '@/app/(child)/missions/[id]';

const mockClaimMission = jest.fn();
const mockCompleteClaim = jest.fn();
let mockSubmissions: any[];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'm-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'child-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: [
        { id: 'm-1', title: 'Clean room', description: 'Tidy up', points_reward: 10, recurrence: 'one_time' },
      ],
      submissions: mockSubmissions,
      claimMission: mockClaimMission,
      completeClaim: mockCompleteClaim,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSubmissions = [];
});

describe('MissionDetailScreen (child)', () => {
  it('renders mission details', () => {
    render(<MissionDetailScreen />);
    expect(screen.getByText('Clean room')).toBeTruthy();
    expect(screen.getByText('Tidy up')).toBeTruthy();
    expect(screen.getByText('+10 pts')).toBeTruthy();
  });

  it('renders claim button when not claimed', () => {
    render(<MissionDetailScreen />);
    expect(screen.getByText('missions.claim')).toBeTruthy();
  });

  it('calls claimMission when claim button pressed', async () => {
    mockClaimMission.mockResolvedValueOnce(undefined);
    render(<MissionDetailScreen />);

    fireEvent.press(screen.getByText('missions.claim'));

    await waitFor(() => {
      expect(mockClaimMission).toHaveBeenCalledWith('m-1', 'child-1', 'fam-1');
    });
  });

  it('shows claimed state with complete button', () => {
    mockSubmissions = [
      { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'claimed', family_id: 'fam-1' },
    ];
    render(<MissionDetailScreen />);
    expect(screen.getByText('missions.claimed')).toBeTruthy();
    expect(screen.getByText('missions.complete')).toBeTruthy();
  });

  it('shows pending state with submitted message', () => {
    mockSubmissions = [
      { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'pending', family_id: 'fam-1' },
    ];
    render(<MissionDetailScreen />);
    expect(screen.getByText('missions.submitted')).toBeTruthy();
  });

  it('calls completeClaim when complete button pressed', async () => {
    mockCompleteClaim.mockResolvedValueOnce(undefined);
    mockSubmissions = [
      { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'claimed', family_id: 'fam-1' },
    ];
    render(<MissionDetailScreen />);

    fireEvent.press(screen.getByText('missions.complete'));

    await waitFor(() => {
      expect(mockCompleteClaim).toHaveBeenCalledWith('s-1', 'fam-1', undefined);
    });
  });
});
