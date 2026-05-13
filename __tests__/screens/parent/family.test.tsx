import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FamilyScreen from '@/app/(parent)/family';

const mockProfile = {
  id: 'parent-1',
  display_name: 'Papa',
  role: 'parent',
  family_id: 'fam-1',
};
const mockFamily = { id: 'fam-1', name: 'Dupont', invite_code: 'XYZ789' };
const mockMembersData = [
  { ...mockProfile },
  { id: 'child-1', display_name: 'Alice', role: 'child', points_balance: 50, family_id: 'fam-1' },
];

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
      members: mockMembersData,
      fetchFamily: jest.fn(),
      fetchMembers: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

describe('FamilyScreen', () => {
  it('renders family name', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('Dupont')).toBeTruthy();
  });

  it('renders invite code', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('XYZ789')).toBeTruthy();
  });

  it('renders share code hint', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('family.shareCode')).toBeTruthy();
  });

  it('renders members list', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('Papa')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('shows "Vous" badge for current user', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('Vous')).toBeTruthy();
  });

  it('displays member roles', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('family.parent')).toBeTruthy();
    expect(screen.getByText(/family.child/)).toBeTruthy();
  });

  it('shows child points', () => {
    render(<FamilyScreen />);
    expect(screen.getByText(/50 pts/)).toBeTruthy();
  });

  it('renders initial letter for child avatar', () => {
    render(<FamilyScreen />);
    expect(screen.getByText('A')).toBeTruthy();
  });
});

describe('FamilyScreen - empty members', () => {
  it('shows empty state when no members', () => {
    const orig = [...mockMembersData];
    mockMembersData.length = 0;

    render(<FamilyScreen />);
    expect(screen.getByText('Dupont')).toBeTruthy();
    expect(screen.getByText('family.noMembers')).toBeTruthy();

    mockMembersData.push(...orig);
  });
});
