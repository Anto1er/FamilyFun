import { useBoardStore } from '@/stores/boardStore';
import { supabase } from '@/lib/supabase';

beforeEach(() => {
  useBoardStore.setState({
    items: [],
    loading: false,
    childId: null,
  });
  jest.clearAllMocks();
});

describe('boardStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useBoardStore.getState();
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.childId).toBeNull();
    });
  });

  describe('loadBoard', () => {
    it('loads items for a child', async () => {
      const items = [
        { id: 'item-1', type: 'emoji', value: '⭐', startX: 100, startY: 100 },
        { id: 'item-2', type: 'shape', value: 'circle', color: '#FF0000', shapeKind: 'circle', startX: 200, startY: 200 },
      ];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { items }, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().loadBoard('child-1');
      const state = useBoardStore.getState();
      expect(state.items).toEqual(items);
      expect(state.loading).toBe(false);
      expect(state.childId).toBe('child-1');
      expect(supabase.from).toHaveBeenCalledWith('boards');
    });

    it('sets items to empty array when no rows found (PGRST116)', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().loadBoard('child-1');
      const state = useBoardStore.getState();
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it('sets items to empty array on unexpected error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'fail' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().loadBoard('child-1');
      const state = useBoardStore.getState();
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it('sets loading to true while fetching', async () => {
      let resolvePromise: any;
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue(new Promise((r) => { resolvePromise = r; })),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const promise = useBoardStore.getState().loadBoard('child-1');
      expect(useBoardStore.getState().loading).toBe(true);
      resolvePromise({ data: { items: [] }, error: null });
      await promise;
      expect(useBoardStore.getState().loading).toBe(false);
    });

    it('handles null data gracefully', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().loadBoard('child-1');
      expect(useBoardStore.getState().items).toEqual([]);
    });
  });

  describe('saveBoard', () => {
    it('saves items and updates local state', async () => {
      const items = [
        { id: 'item-1', type: 'emoji' as const, value: '⭐', startX: 100, startY: 100 },
      ];
      const chain = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().saveBoard('child-1', items);
      const state = useBoardStore.getState();
      expect(state.items).toEqual(items);
      expect(chain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          child_id: 'child-1',
          items,
        }),
        { onConflict: 'child_id' }
      );
    });

    it('logs warning on save error but still updates local state', async () => {
      const items = [
        { id: 'item-1', type: 'emoji' as const, value: '⭐', startX: 50, startY: 50 },
      ];
      const chain = {
        upsert: jest.fn().mockResolvedValue({ error: { message: 'Save failed' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().saveBoard('child-1', items);
      expect(useBoardStore.getState().items).toEqual(items);
    });

    it('saves empty items array', async () => {
      const chain = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useBoardStore.getState().saveBoard('child-1', []);
      expect(useBoardStore.getState().items).toEqual([]);
      expect(chain.upsert).toHaveBeenCalled();
    });
  });

  describe('clearBoard', () => {
    it('clears all items from local state', () => {
      useBoardStore.setState({
        items: [
          { id: 'item-1', type: 'emoji', value: '⭐', startX: 0, startY: 0 },
          { id: 'item-2', type: 'shape', value: 'circle', startX: 0, startY: 0 },
        ],
      });

      useBoardStore.getState().clearBoard();
      expect(useBoardStore.getState().items).toEqual([]);
    });

    it('does nothing when already empty', () => {
      useBoardStore.getState().clearBoard();
      expect(useBoardStore.getState().items).toEqual([]);
    });
  });
});
