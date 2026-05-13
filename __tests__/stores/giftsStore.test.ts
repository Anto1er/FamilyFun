import { useGiftsStore } from '@/stores/giftsStore';
import { supabase } from '@/lib/supabase';

beforeEach(() => {
  useGiftsStore.setState({
    gifts: [],
    loading: false,
  });
  jest.clearAllMocks();
});

describe('giftsStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useGiftsStore.getState();
      expect(state.gifts).toEqual([]);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchGifts', () => {
    it('fetches gifts for a family', async () => {
      const gifts = [
        { id: 'g-1', title: 'Toy', status: 'approved', points_cost: 50 },
        { id: 'g-2', title: 'Book', status: 'pending_approval', points_cost: null },
      ];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: gifts, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useGiftsStore.getState().fetchGifts('fam-1');
      const state = useGiftsStore.getState();
      expect(state.gifts).toEqual(gifts);
      expect(state.loading).toBe(false);
    });

    it('sets loading to false even on error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(useGiftsStore.getState().fetchGifts('fam-1')).rejects.toThrow('DB error');
      expect(useGiftsStore.getState().loading).toBe(false);
    });
  });

  describe('addGift', () => {
    it('inserts gift and re-fetches gifts', async () => {
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ id: 'g-new', title: 'New Toy', family_id: 'fam-1', status: 'pending_approval' }],
          error: null,
        }),
      };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(fetchChain);

      await useGiftsStore.getState().addGift({
        family_id: 'fam-1',
        child_id: 'child-1',
        title: 'New Toy',
      });
      expect(insertChain.insert).toHaveBeenCalled();
      expect(useGiftsStore.getState().gifts).toHaveLength(1);
    });
  });

  describe('approveGift', () => {
    it('updates gift status to approved in local state', async () => {
      useGiftsStore.setState({
        gifts: [
          { id: 'g-1', title: 'Toy', status: 'pending_approval', points_cost: null } as any,
        ],
      });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useGiftsStore.getState().approveGift('g-1', 50, 'parent-1');
      const state = useGiftsStore.getState();
      expect(state.gifts[0].status).toBe('approved');
      expect(state.gifts[0].points_cost).toBe(50);
    });
  });

  describe('rejectGift', () => {
    it('updates gift status to rejected', async () => {
      useGiftsStore.setState({
        gifts: [{ id: 'g-1', status: 'pending_approval' } as any],
      });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useGiftsStore.getState().rejectGift('g-1');
      expect(useGiftsStore.getState().gifts[0].status).toBe('rejected');
    });
  });

  describe('redeemGift', () => {
    it('updates gift status to redeemed', async () => {
      useGiftsStore.setState({
        gifts: [{ id: 'g-1', status: 'approved' } as any],
      });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useGiftsStore.getState().redeemGift('g-1');
      expect(useGiftsStore.getState().gifts[0].status).toBe('redeemed');
    });
  });

  describe('deleteGift', () => {
    it('removes gift from local state', async () => {
      useGiftsStore.setState({
        gifts: [
          { id: 'g-1', title: 'Gift 1' } as any,
          { id: 'g-2', title: 'Gift 2' } as any,
        ],
      });
      const chain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useGiftsStore.getState().deleteGift('g-1');
      const state = useGiftsStore.getState();
      expect(state.gifts).toHaveLength(1);
      expect(state.gifts[0].id).toBe('g-2');
    });

    it('throws on supabase error', async () => {
      const chain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: new Error('Delete failed') }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(useGiftsStore.getState().deleteGift('g-1')).rejects.toThrow('Delete failed');
    });
  });
});
