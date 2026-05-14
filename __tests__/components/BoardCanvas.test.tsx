import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { BoardCanvas } from '@/components/BoardCanvas';
import { useBoardStore } from '@/stores/boardStore';
import { COLORS } from '@/lib/constants';

const mockLoadBoard = jest.fn();
const mockSaveBoard = jest.fn();

jest.mock('@/stores/boardStore', () => ({
  useBoardStore: jest.fn(),
  BoardItemData: {},
}));

const createMockStore = (overrides: any = {}) => ({
  items: [],
  loading: false,
  loadBoard: mockLoadBoard,
  saveBoard: mockSaveBoard,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (useBoardStore as unknown as jest.Mock).mockImplementation(() => createMockStore());
});

afterEach(() => {
  jest.useRealTimers();
});

describe('BoardCanvas', () => {
  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({ loading: true })
      );
      render(<BoardCanvas childId="child-1" />);
      // ActivityIndicator should be rendered (no toolbar visible)
      expect(screen.queryByText('board.emojis')).toBeNull();
    });

    it('calls loadBoard on mount with childId', () => {
      render(<BoardCanvas childId="child-1" />);
      expect(mockLoadBoard).toHaveBeenCalledWith('child-1');
    });

    it('calls loadBoard with different childId', () => {
      render(<BoardCanvas childId="child-99" />);
      expect(mockLoadBoard).toHaveBeenCalledWith('child-99');
    });
  });

  describe('toolbar', () => {
    it('renders toolbar with three category buttons', () => {
      render(<BoardCanvas childId="child-1" />);
      expect(screen.getByText('board.emojis')).toBeTruthy();
      expect(screen.getByText('board.stickers')).toBeTruthy();
      expect(screen.getByText('board.shapes')).toBeTruthy();
    });

    it('shows emoji picker when emojis button is pressed', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.emojis'));
      // Emojis should appear in the picker
      expect(screen.getByText('⭐')).toBeTruthy();
      expect(screen.getByText('❤️')).toBeTruthy();
      expect(screen.getByText('🚀')).toBeTruthy();
    });

    it('hides emoji picker when emojis button is pressed again', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.emojis'));
      expect(screen.getByText('⭐')).toBeTruthy();

      fireEvent.press(screen.getByText('board.emojis'));
      expect(screen.queryByText('⭐')).toBeNull();
    });

    it('switches picker when different category is selected', () => {
      render(<BoardCanvas childId="child-1" />);

      // Open emojis
      fireEvent.press(screen.getByText('board.emojis'));
      expect(screen.getByText('⭐')).toBeTruthy();

      // Switch to stickers
      fireEvent.press(screen.getByText('board.stickers'));
      expect(screen.queryByText('⭐')).toBeNull();
    });
  });

  describe('adding items', () => {
    it('adds emoji item when emoji is tapped in picker', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.emojis'));
      fireEvent.press(screen.getByText('⭐'));

      // After adding, picker should close and saveBoard should be scheduled
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(mockSaveBoard).toHaveBeenCalledWith(
        'child-1',
        expect.arrayContaining([
          expect.objectContaining({ type: 'emoji', value: '⭐' }),
        ])
      );
    });

    it('closes picker after adding item', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.emojis'));
      expect(screen.getByText('⭐')).toBeTruthy();

      fireEvent.press(screen.getByText('⭐'));
      // Picker should be closed (category set to null)
      expect(screen.queryByText('🚀')).toBeNull();
    });

    it('opens stickers picker and adds a sticker', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.stickers'));
      fireEvent.press(screen.getByTestId('sticker-trophy'));

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(mockSaveBoard).toHaveBeenCalledWith(
        'child-1',
        expect.arrayContaining([
          expect.objectContaining({ type: 'sticker', value: 'trophy' }),
        ])
      );
    });

    it('opens shapes picker and adds a circle shape', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.shapes'));
      fireEvent.press(screen.getByTestId(`shape-circle-${COLORS.primary}`));

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(mockSaveBoard).toHaveBeenCalledWith(
        'child-1',
        expect.arrayContaining([
          expect.objectContaining({ type: 'shape', value: 'circle', shapeKind: 'circle', color: COLORS.primary }),
        ])
      );
    });

    it('opens shapes picker and adds a square shape', () => {
      render(<BoardCanvas childId="child-1" />);
      fireEvent.press(screen.getByText('board.shapes'));
      fireEvent.press(screen.getByTestId(`shape-square-${COLORS.secondary}`));

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(mockSaveBoard).toHaveBeenCalledWith(
        'child-1',
        expect.arrayContaining([
          expect.objectContaining({ type: 'shape', value: 'square', shapeKind: 'square', color: COLORS.secondary }),
        ])
      );
    });
  });

  describe('rendering items', () => {
    it('renders emoji items on canvas', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'emoji', value: '🎉', startX: 100, startY: 100 },
          ],
        })
      );
      render(<BoardCanvas childId="child-1" />);
      expect(screen.getByText('🎉')).toBeTruthy();
    });

    it('renders multiple items on canvas', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'emoji', value: '🎉', startX: 100, startY: 100 },
            { id: 'item-2', type: 'emoji', value: '🌈', startX: 200, startY: 200 },
          ],
        })
      );
      render(<BoardCanvas childId="child-1" />);
      expect(screen.getByText('🎉')).toBeTruthy();
      expect(screen.getByText('🌈')).toBeTruthy();
    });

    it('renders shape items on canvas', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'shape', value: 'circle', color: '#FF0000', shapeKind: 'circle', startX: 100, startY: 100 },
          ],
        })
      );
      const { toJSON } = render(<BoardCanvas childId="child-1" />);
      // Shape renders as a View, just check it doesn't crash
      expect(toJSON()).toBeTruthy();
    });

    it('renders sticker items on canvas', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'sticker', value: 'trophy', color: '#4CAF50', startX: 100, startY: 100 },
          ],
        })
      );
      const { toJSON } = render(<BoardCanvas childId="child-1" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders sticker without color (uses default)', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'sticker', value: 'star', startX: 50, startY: 50 },
          ],
        })
      );
      const { toJSON } = render(<BoardCanvas childId="child-1" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders square shape items', () => {
      (useBoardStore as unknown as jest.Mock).mockImplementation(() =>
        createMockStore({
          items: [
            { id: 'item-1', type: 'shape', value: 'square', color: '#0000FF', shapeKind: 'square', startX: 100, startY: 100 },
          ],
        })
      );
      const { toJSON } = render(<BoardCanvas childId="child-1" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('debounced save', () => {
    it('debounces multiple quick adds', () => {
      render(<BoardCanvas childId="child-1" />);

      // Add first emoji
      fireEvent.press(screen.getByText('board.emojis'));
      fireEvent.press(screen.getByText('⭐'));

      // Add second emoji quickly
      fireEvent.press(screen.getByText('board.emojis'));
      fireEvent.press(screen.getByText('❤️'));

      // Before debounce, saveBoard should not be called yet (previous timeout cleared)
      act(() => {
        jest.advanceTimersByTime(499);
      });
      expect(mockSaveBoard).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockSaveBoard).toHaveBeenCalledTimes(1);
    });
  });
});
