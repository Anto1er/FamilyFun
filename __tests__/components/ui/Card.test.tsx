import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('applies custom style', () => {
    const { toJSON } = render(
      <Card style={{ marginTop: 20 }}>
        <Text>Styled card</Text>
      </Card>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <Text>First child</Text>
        <Text>Second child</Text>
      </Card>
    );
    expect(screen.getByText('First child')).toBeTruthy();
    expect(screen.getByText('Second child')).toBeTruthy();
  });
});
