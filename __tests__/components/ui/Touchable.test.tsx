import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Touchable } from '@/components/ui/Touchable';

describe('Touchable', () => {
  it('renders children', () => {
    render(
      <Touchable>
        <Text>Touchable content</Text>
      </Touchable>
    );
    expect(screen.getByText('Touchable content')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <Touchable onPress={onPress}>
        <Text>Press me</Text>
      </Touchable>
    );
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not crash when no onPress is provided', () => {
    render(
      <Touchable>
        <Text>No handler</Text>
      </Touchable>
    );
    expect(screen.getByText('No handler')).toBeTruthy();
  });
});
