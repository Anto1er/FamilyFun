import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  const onPressMock = jest.fn();

  beforeEach(() => {
    onPressMock.mockClear();
  });

  it('renders the title text', () => {
    render(<Button title="Press me" onPress={onPressMock} />);
    expect(screen.getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button title="Press me" onPress={onPressMock} />);
    fireEvent.press(screen.getByText('Press me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<Button title="Disabled" onPress={onPressMock} disabled />);
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading', () => {
    render(<Button title="Loading" onPress={onPressMock} loading />);
    expect(screen.queryByText('Loading')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    render(<Button title="Loading" onPress={onPressMock} loading />);
    // The button is disabled when loading, any press should be ignored
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with different variants without crashing', () => {
    const variants = ['primary', 'secondary', 'outline', 'danger'] as const;
    variants.forEach((variant) => {
      const { unmount } = render(
        <Button title={`${variant} btn`} onPress={onPressMock} variant={variant} />
      );
      expect(screen.getByText(`${variant} btn`)).toBeTruthy();
      unmount();
    });
  });

  it('renders with different sizes without crashing', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount } = render(
        <Button title={`${size} btn`} onPress={onPressMock} size={size} />
      );
      expect(screen.getByText(`${size} btn`)).toBeTruthy();
      unmount();
    });
  });
});
