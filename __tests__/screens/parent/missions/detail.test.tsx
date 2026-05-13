import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ParentMissionDetailScreen from '@/app/(parent)/missions/[id]';

const mockValidateSubmission = jest.fn();
const mockArchiveMission = jest.fn();
const mockFetchSubmissions = jest.fn();
const mockFetchProfile = jest.fn();

let mockMissions: any[];
let mockSubmissions: any[];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'm-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      profile: { id: 'parent-1', family_id: 'fam-1' },
      fetchProfile: mockFetchProfile,
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: mockMissions,
      submissions: mockSubmissions,
      fetchSubmissions: mockFetchSubmissions,
      validateSubmission: mockValidateSubmission,
      archiveMission: mockArchiveMission,
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

beforeEach(() => {
  jest.clearAllMocks();
  mockMissions = [
    { id: 'm-1', title: 'Clean room', description: 'Tidy up', points_reward: 10, recurrence: 'one_time', status: 'active' },
  ];
  mockSubmissions = [
    { id: 's-1', mission_id: 'm-1', child_id: 'child-1', status: 'pending', note: 'Done!', created_at: '2025-01-01', family_id: 'fam-1' },
  ];
});

describe('ParentMissionDetailScreen', () => {
  it('renders mission title and details', () => {
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('Clean room')).toBeTruthy();
    expect(screen.getByText('Tidy up')).toBeTruthy();
    expect(screen.getByText('+10 pts')).toBeTruthy();
  });

  it('renders pending submissions with child name and note', () => {
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Done!')).toBeTruthy();
  });

  it('renders approve and reject buttons for pending submissions', () => {
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('missions.approved')).toBeTruthy();
    expect(screen.getByText('missions.rejected')).toBeTruthy();
  });

  it('renders archive/delete button', () => {
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('common.delete')).toBeTruthy();
  });

  // --- handleValidate branches ---

  it('calls validateSubmission with approved and fetches submissions', async () => {
    mockValidateSubmission.mockResolvedValueOnce(undefined);
    mockFetchSubmissions.mockResolvedValueOnce(undefined);
    render(<ParentMissionDetailScreen />);

    fireEvent.press(screen.getByText('missions.approved'));

    await waitFor(() => {
      expect(mockValidateSubmission).toHaveBeenCalledWith('s-1', 'approved', 'parent-1');
      expect(mockFetchSubmissions).toHaveBeenCalledWith('fam-1');
    });
  });

  it('calls validateSubmission with rejected', async () => {
    mockValidateSubmission.mockResolvedValueOnce(undefined);
    mockFetchSubmissions.mockResolvedValueOnce(undefined);
    render(<ParentMissionDetailScreen />);

    fireEvent.press(screen.getByText('missions.rejected'));

    await waitFor(() => {
      expect(mockValidateSubmission).toHaveBeenCalledWith('s-1', 'rejected', 'parent-1');
    });
  });

  it('shows alert when validateSubmission throws', async () => {
    mockValidateSubmission.mockRejectedValueOnce(new Error('Validation failed'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentMissionDetailScreen />);

    fireEvent.press(screen.getByText('missions.approved'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('common.error', expect.stringContaining('Validation failed'));
    });
  });

  // --- handleArchive branches ---

  it('shows archive confirmation dialog', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentMissionDetailScreen />);
    fireEvent.press(screen.getByText('common.delete'));
    expect(alertSpy).toHaveBeenCalledWith('common.confirm', '', expect.any(Array));
  });

  it('calls archiveMission when confirm pressed in archive dialog', async () => {
    mockArchiveMission.mockResolvedValueOnce(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ParentMissionDetailScreen />);

    fireEvent.press(screen.getByText('common.delete'));

    // Extract the confirm button callback (second button in array)
    const buttons = alertSpy.mock.calls[0][2] as any[];
    const confirmButton = buttons.find((b: any) => b.text === 'common.confirm');
    await confirmButton.onPress();

    expect(mockArchiveMission).toHaveBeenCalledWith('m-1');
  });

  // --- Mission not found ---

  it('returns null when mission not found', () => {
    mockMissions.length = 0;
    const { toJSON } = render(<ParentMissionDetailScreen />);
    expect(toJSON()).toBeNull();
  });

  // --- Mission without description ---

  it('renders mission without description', () => {
    mockMissions[0] = { ...mockMissions[0], description: null };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('Clean room')).toBeTruthy();
    expect(screen.queryByText('Tidy up')).toBeNull();
  });

  // --- Submission without note ---

  it('renders submission without note', () => {
    mockSubmissions[0] = { ...mockSubmissions[0], note: null };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.queryByText('Done!')).toBeNull();
  });

  // --- Claimed submission ---

  it('renders claimed submission with claimed text', () => {
    mockSubmissions[0] = { ...mockSubmissions[0], status: 'claimed' };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('missions.claimed')).toBeTruthy();
    // No approve/reject buttons for claimed
    expect(screen.queryByText('missions.approved')).toBeNull();
  });

  // --- Already approved submission ---

  it('renders approved submission status text', () => {
    mockSubmissions[0] = { ...mockSubmissions[0], status: 'approved' };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('missions.approved')).toBeTruthy();
    // Should be a plain text, not a button - no reject button either
    expect(screen.queryByText('missions.rejected')).toBeNull();
  });

  // --- Already rejected submission ---

  it('renders rejected submission status text', () => {
    mockSubmissions[0] = { ...mockSubmissions[0], status: 'rejected' };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('missions.rejected')).toBeTruthy();
  });

  // --- Child name fallback ---

  it('shows ? for unknown child', () => {
    mockSubmissions[0] = { ...mockSubmissions[0], child_id: 'unknown-child' };
    render(<ParentMissionDetailScreen />);
    expect(screen.getByText('?')).toBeTruthy();
  });
});
