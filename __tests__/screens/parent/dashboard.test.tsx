import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ParentDashboard from '@/app/(parent)/index';

let mockProfile: any;
let mockFamily: any;
let mockMembers: any[];
let mockMissions: any[];
let mockSubmissions: any[];
let mockGifts: any[];

beforeEach(() => {
  mockProfile = {
    id: 'parent-1',
    display_name: 'Papa',
    role: 'parent',
    family_id: 'fam-1',
    points_balance: 0,
  };
  mockFamily = { id: 'fam-1', name: 'Dupont', invite_code: 'ABC123' };
  mockMembers = [
    mockProfile,
    { id: 'child-1', display_name: 'Alice', role: 'child', points_balance: 50, family_id: 'fam-1' },
    { id: 'child-2', display_name: 'Bob', role: 'child', points_balance: 30, family_id: 'fam-1' },
  ];
  mockMissions = [
    { id: 'm-1', title: 'Clean room', status: 'active', points_reward: 10, family_id: 'fam-1' },
  ];
  mockSubmissions = [
    { id: 's-1', mission_id: 'm-1', child_id: 'child-1', family_id: 'fam-1', status: 'pending' },
  ];
  mockGifts = [];
});

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: mockProfile };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/familyStore', () => ({
  useFamilyStore: (selector: any) => {
    const state = {
      family: mockFamily,
      members: mockMembers,
      fetchFamily: jest.fn(),
      fetchMembers: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/missionsStore', () => ({
  useMissionsStore: (selector: any) => {
    const state = {
      missions: mockMissions,
      submissions: mockSubmissions,
      fetchMissions: jest.fn(),
      fetchSubmissions: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/stores/giftsStore', () => ({
  useGiftsStore: (selector: any) => {
    const state = { gifts: mockGifts, fetchGifts: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

describe('ParentDashboard', () => {
  it('renders welcome message with parent name', () => {
    render(<ParentDashboard />);
    expect(screen.getByText(/dashboard.welcome/)).toBeTruthy();
  });

  it('displays children section', () => {
    render(<ParentDashboard />);
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('displays missions section', () => {
    render(<ParentDashboard />);
    expect(screen.getAllByText('missions.title').length).toBeGreaterThanOrEqual(1);
  });

  it('shows pending submissions count', () => {
    render(<ParentDashboard />);
    expect(screen.getByText(/1.*dashboard.awaitingValidation/i)).toBeTruthy();
  });

  it('displays active missions count', () => {
    render(<ParentDashboard />);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('displays claimed submissions section when claimed exist', () => {
    mockSubmissions.push(
      { id: 's-2', mission_id: 'm-1', child_id: 'child-2', family_id: 'fam-1', status: 'claimed' }
    );
    render(<ParentDashboard />);
    expect(screen.getByText(/dashboard.claimedMissions/i)).toBeTruthy();
  });
});

describe('ParentDashboard - empty children', () => {
  it('shows invite code when no children', () => {
    mockMembers.length = 0;
    mockMembers.push(mockProfile); // Only parent, no children
    render(<ParentDashboard />);
    expect(screen.getByText('family.shareCode')).toBeTruthy();
    expect(screen.getByText('ABC123')).toBeTruthy();
  });
});
