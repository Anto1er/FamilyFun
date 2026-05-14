import React from 'react';
import { render } from '@testing-library/react-native';
import BoardScreen from '@/app/(child)/board';

const mockProfile = {
  id: 'child-1',
  display_name: 'Alice',
  role: 'child',
  family_id: 'fam-1',
  points_balance: 75,
};

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { profile: mockProfile };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/components/BoardCanvas', () => ({
  BoardCanvas: ({ childId }: { childId: string }) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>BoardCanvas-{childId}</Text>
      </View>
    );
  },
}));

describe('BoardScreen (child)', () => {
  it('renders BoardCanvas with profile id', () => {
    const { getByText } = render(<BoardScreen />);
    expect(getByText('BoardCanvas-child-1')).toBeTruthy();
  });

  it('returns null when no profile', () => {
    jest.spyOn(require('@/stores/authStore'), 'useAuthStore').mockImplementation(
      (selector: any) => {
        const state = { profile: null };
        return selector ? selector(state) : state;
      }
    );
    const { toJSON } = render(<BoardScreen />);
    expect(toJSON()).toBeNull();
  });
});
