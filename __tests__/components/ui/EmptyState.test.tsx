import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title text', () => {
    render(<EmptyState icon="rocket-outline" title="No missions" />);
    expect(screen.getByText('No missions')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(
      <EmptyState
        icon="gift-outline"
        title="No gifts"
        subtitle="Add your first gift"
      />
    );
    expect(screen.getByText('No gifts')).toBeTruthy();
    expect(screen.getByText('Add your first gift')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    render(<EmptyState icon="rocket-outline" title="Empty" />);
    expect(screen.getByText('Empty')).toBeTruthy();
    // No subtitle should be rendered
    expect(screen.queryByText('Add your first gift')).toBeNull();
  });
});
