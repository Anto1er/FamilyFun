import React from 'react';
import { render } from '@testing-library/react-native';

// We need to test different states, so use a mutable variable
let mockSession: any = null;
let mockProfile: any = null;

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    session: mockSession,
    profile: mockProfile,
  }),
}));

// Capture what Redirect gets rendered with
let lastRedirectHref: string | null = null;
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    lastRedirectHref = href;
    return null;
  },
}));

import Index from '@/app/index';

beforeEach(() => {
  mockSession = null;
  mockProfile = null;
  lastRedirectHref = null;
});

describe('App Index', () => {
  it('redirects to login when no session', () => {
    render(<Index />);
    expect(lastRedirectHref).toBe('/(auth)/login');
  });

  it('redirects to family-setup when session but no family_id', () => {
    mockSession = { user: { id: 'user-1' } };
    mockProfile = { id: 'user-1', role: 'parent', family_id: null };
    render(<Index />);
    expect(lastRedirectHref).toBe('/(auth)/family-setup');
  });

  it('redirects to parent when parent role with family_id', () => {
    mockSession = { user: { id: 'user-1' } };
    mockProfile = { id: 'user-1', role: 'parent', family_id: 'fam-1' };
    render(<Index />);
    expect(lastRedirectHref).toBe('/(parent)');
  });

  it('redirects to child when child role with family_id', () => {
    mockSession = { user: { id: 'user-1' } };
    mockProfile = { id: 'user-1', role: 'child', family_id: 'fam-1' };
    render(<Index />);
    expect(lastRedirectHref).toBe('/(child)');
  });

  it('redirects to family-setup when profile has no family_id (undefined)', () => {
    mockSession = { user: { id: 'user-1' } };
    mockProfile = { id: 'user-1', role: 'parent' }; // no family_id property
    render(<Index />);
    expect(lastRedirectHref).toBe('/(auth)/family-setup');
  });
});
