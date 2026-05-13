import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditMissionScreen from '@/app/(parent)/missions/edit';

const mockUpdateMission = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'm-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: [
        { id: 'm-1', title: 'Clean room', description: 'Tidy up', points_reward: 10, recurrence: 'one_time' },
      ],
      updateMission: mockUpdateMission,
    };
    return selector ? selector(state) : state;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EditMissionScreen', () => {
  it('renders pre-filled form', () => {
    render(<EditMissionScreen />);
    expect(screen.getByText('missions.missionTitle')).toBeTruthy();
    expect(screen.getByText('missions.description')).toBeTruthy();
    expect(screen.getByText('missions.pointsReward')).toBeTruthy();
    expect(screen.getByText('missions.recurrence')).toBeTruthy();
  });

  it('renders recurrence options', () => {
    render(<EditMissionScreen />);
    expect(screen.getByText('missions.oneTime')).toBeTruthy();
    expect(screen.getByText('missions.daily')).toBeTruthy();
    expect(screen.getByText('missions.weekly')).toBeTruthy();
  });

  it('saves updated mission', async () => {
    mockUpdateMission.mockResolvedValueOnce(undefined);
    render(<EditMissionScreen />);

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockUpdateMission).toHaveBeenCalledWith('m-1', {
        title: 'Clean room',
        description: 'Tidy up',
        points_reward: 10,
        recurrence: 'one_time',
      });
    });
  });
});
