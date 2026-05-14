import React from 'react';
import { render } from '@testing-library/react-native';
import ChildBoardScreen from '@/app/child-detail/board';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
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

const { useLocalSearchParams } = require('expo-router');

describe('ChildBoardScreen (parent)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders BoardCanvas with childId from search params', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ childId: 'child-42' });
    const { getByText } = render(<ChildBoardScreen />);
    expect(getByText('BoardCanvas-child-42')).toBeTruthy();
  });

  it('returns null when childId is missing', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    const { toJSON } = render(<ChildBoardScreen />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when childId is empty string', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ childId: '' });
    const { toJSON } = render(<ChildBoardScreen />);
    expect(toJSON()).toBeNull();
  });
});
