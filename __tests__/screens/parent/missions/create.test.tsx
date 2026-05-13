import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TextInput } from 'react-native';
import CreateMissionScreen from '@/app/(parent)/missions/create';

const mockCreateMission = jest.fn();
const mockClaimMission = jest.fn();
const mockBack = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: { id: 'parent-1', family_id: 'fam-1' } };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = { createMission: mockCreateMission, claimMission: mockClaimMission };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      members: [
        { id: 'child-1', display_name: 'Alice', role: 'child' },
        { id: 'child-2', display_name: 'Bob', role: 'child' },
      ],
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreateMissionScreen', () => {
  it('renders mission creation form', () => {
    render(<CreateMissionScreen />);
    expect(screen.getByText('missions.missionTitle')).toBeTruthy();
    expect(screen.getByText('missions.description')).toBeTruthy();
    expect(screen.getByText('missions.pointsReward')).toBeTruthy();
    expect(screen.getByText('missions.recurrence')).toBeTruthy();
  });

  it('renders recurrence options', () => {
    render(<CreateMissionScreen />);
    expect(screen.getByText('missions.oneTime')).toBeTruthy();
    expect(screen.getByText('missions.daily')).toBeTruthy();
    expect(screen.getByText('missions.weekly')).toBeTruthy();
  });

  it('renders assign-to options with children', () => {
    render(<CreateMissionScreen />);
    expect(screen.getByText('missions.assignTo')).toBeTruthy();
    expect(screen.getByText('missions.everyone')).toBeTruthy();
    expect(screen.getByText('missions.noOne')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('creates a mission on save with everyone assigned', async () => {
    mockCreateMission.mockResolvedValueOnce('new-mission-id');
    mockClaimMission.mockResolvedValue(undefined);
    render(<CreateMissionScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Clean room');
    fireEvent.changeText(inputs[2], '10');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockCreateMission).toHaveBeenCalledWith({
        family_id: 'fam-1',
        created_by: 'parent-1',
        title: 'Clean room',
        description: null,
        points_reward: 10,
        recurrence: 'one_time',
      });
    });
  });

  it('assigns mission to specific child', async () => {
    mockCreateMission.mockResolvedValueOnce('new-mission-id');
    mockClaimMission.mockResolvedValue(undefined);
    render(<CreateMissionScreen />);

    // Select Alice specifically
    fireEvent.press(screen.getByText('Alice'));

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Homework');
    fireEvent.changeText(inputs[2], '20');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockCreateMission).toHaveBeenCalled();
      expect(mockClaimMission).toHaveBeenCalledWith('new-mission-id', 'child-1', 'fam-1', true);
    });
  });

  it('assigns mission to none', async () => {
    mockCreateMission.mockResolvedValueOnce('new-mission-id');
    render(<CreateMissionScreen />);

    // Select "No one"
    fireEvent.press(screen.getByText('missions.noOne'));

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Optional mission');
    fireEvent.changeText(inputs[2], '5');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockCreateMission).toHaveBeenCalled();
      // claimMission should NOT be called when assignedChildId is 'none'
      expect(mockClaimMission).not.toHaveBeenCalled();
    });
  });

  it('shows error alert on create failure', async () => {
    mockCreateMission.mockRejectedValueOnce(new Error('Create failed'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<CreateMissionScreen />);

    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Test');
    fireEvent.changeText(inputs[2], '10');

    fireEvent.press(screen.getByText('common.save'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('common.error', 'Create failed');
    });
  });
});
