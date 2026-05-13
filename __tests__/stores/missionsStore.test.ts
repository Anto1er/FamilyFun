import { useMissionsStore } from '@/stores/missionsStore';
import { supabase } from '@/lib/supabase';

beforeEach(() => {
  useMissionsStore.setState({
    missions: [],
    submissions: [],
    loading: false,
  });
  jest.clearAllMocks();
});

describe('missionsStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useMissionsStore.getState();
      expect(state.missions).toEqual([]);
      expect(state.submissions).toEqual([]);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchMissions', () => {
    it('fetches active missions for a family', async () => {
      const missions = [
        { id: 'm-1', title: 'Clean room', status: 'active', points_reward: 10 },
        { id: 'm-2', title: 'Do homework', status: 'active', points_reward: 20 },
      ];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: missions, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useMissionsStore.getState().fetchMissions('fam-1');
      const state = useMissionsStore.getState();
      expect(state.missions).toEqual(missions);
      expect(state.loading).toBe(false);
    });
  });

  describe('createMission', () => {
    it('creates mission and returns id', async () => {
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
      };
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(fetchChain);

      const result = await useMissionsStore.getState().createMission({
        family_id: 'fam-1',
        created_by: 'parent-1',
        title: 'New Mission',
        description: null,
        points_reward: 15,
        recurrence: 'one_time',
      } as any);
      expect(result).toBe('new-id');
    });
  });

  describe('fetchSubmissions', () => {
    it('fetches submissions for a family', async () => {
      const submissions = [
        { id: 's-1', mission_id: 'm-1', child_id: 'c-1', status: 'pending' },
        { id: 's-2', mission_id: 'm-2', child_id: 'c-1', status: 'claimed' },
      ];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: submissions, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useMissionsStore.getState().fetchSubmissions('fam-1');
      expect(useMissionsStore.getState().submissions).toEqual(submissions);
    });
  });

  describe('claimMission', () => {
    it('claims mission and notifies parents when child claims', async () => {
      useMissionsStore.setState({
        missions: [{ id: 'm-1', title: 'Clean room', points_reward: 10 } as any],
      });

      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };
      const fetchSubsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { display_name: 'Alice' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)       // insert submission
        .mockReturnValueOnce(fetchSubsChain)    // fetchSubmissions
        .mockReturnValueOnce(profileChain);     // profiles select for child name

      await useMissionsStore.getState().claimMission('m-1', 'child-1', 'fam-1', false);
      expect(insertChain.insert).toHaveBeenCalled();
    });

    it('claims mission and notifies child when parent assigns', async () => {
      useMissionsStore.setState({
        missions: [{ id: 'm-1', title: 'Clean room', points_reward: 10 } as any],
      });

      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };
      const fetchSubsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(fetchSubsChain);

      await useMissionsStore.getState().claimMission('m-1', 'child-1', 'fam-1', true);
      expect(insertChain.insert).toHaveBeenCalled();
    });
  });

  describe('submitMission', () => {
    it('submits mission and fetches submissions', async () => {
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(fetchChain);

      await useMissionsStore.getState().submitMission('m-1', 'child-1', 'fam-1', 'Done!');
      expect(insertChain.insert).toHaveBeenCalledWith({
        mission_id: 'm-1',
        child_id: 'child-1',
        family_id: 'fam-1',
        note: 'Done!',
      });
    });
  });

  describe('completeClaim', () => {
    it('completes claim and fetches submissions', async () => {
      useMissionsStore.setState({
        submissions: [{ id: 's-1', mission_id: 'm-1', child_id: 'c-1', family_id: 'fam-1', status: 'claimed' } as any],
        missions: [{ id: 'm-1', title: 'Clean room', points_reward: 10 } as any],
      });

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{ id: 's-1' }], error: null }),
      };
      const fetchSubsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ id: 's-1', mission_id: 'm-1', child_id: 'c-1', family_id: 'fam-1', status: 'pending' }],
          error: null,
        }),
      };
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { display_name: 'Alice' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(updateChain)       // update submission
        .mockReturnValueOnce(fetchSubsChain)    // fetchSubmissions
        .mockReturnValueOnce(profileChain);     // profiles select for child name

      await useMissionsStore.getState().completeClaim('s-1', 'fam-1', 'Finished!');
      expect(updateChain.update).toHaveBeenCalledWith({
        status: 'pending',
        note: 'Finished!',
      });
    });

    it('throws error when update returns empty data', async () => {
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(updateChain);

      await expect(
        useMissionsStore.getState().completeClaim('s-1', 'fam-1')
      ).rejects.toThrow('Failed to update submission');
    });
  });

  describe('archiveMission', () => {
    it('removes mission from local state after archiving', async () => {
      useMissionsStore.setState({
        missions: [
          { id: 'm-1', title: 'Clean room' } as any,
          { id: 'm-2', title: 'Do homework' } as any,
        ],
      });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useMissionsStore.getState().archiveMission('m-1');
      const state = useMissionsStore.getState();
      expect(state.missions).toHaveLength(1);
      expect(state.missions[0].id).toBe('m-2');
    });
  });

  describe('updateMission', () => {
    it('updates mission in local state', async () => {
      useMissionsStore.setState({
        missions: [
          { id: 'm-1', title: 'Old title', points_reward: 10 } as any,
        ],
      });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await useMissionsStore.getState().updateMission('m-1', { title: 'New title' });
      const state = useMissionsStore.getState();
      expect(state.missions[0].title).toBe('New title');
    });
  });

  describe('validateSubmission', () => {
    it('calls supabase update with validation data', async () => {
      useMissionsStore.setState({
        submissions: [
          { id: 's-1', mission_id: 'm-1', child_id: 'c-1', family_id: 'f-1', status: 'pending' } as any,
        ],
        missions: [
          { id: 'm-1', title: 'Test', points_reward: 10 } as any,
        ],
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn();
      const chain1 = { update: mockUpdate, eq: mockEq };
      mockEq.mockResolvedValueOnce({ error: null });

      const chain2 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(chain1)
        .mockReturnValueOnce(chain2);

      await useMissionsStore.getState().validateSubmission('s-1', 'approved', 'parent-1');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('parentDirectValidate', () => {
    it('inserts claimed submission then updates to approved', async () => {
      useMissionsStore.setState({
        missions: [{ id: 'm-1', title: 'Clean room', points_reward: 10 } as any],
      });

      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 's-new' }, error: null }),
      };
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const fetchSubsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [{ id: 's-new', status: 'approved' }], error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)       // insert as claimed
        .mockReturnValueOnce(updateChain)       // update to approved
        .mockReturnValueOnce(fetchSubsChain);   // fetchSubmissions

      await useMissionsStore.getState().parentDirectValidate('m-1', 'child-1', 'fam-1', 'parent-1');
      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          mission_id: 'm-1',
          child_id: 'child-1',
          family_id: 'fam-1',
          status: 'claimed',
        })
      );
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'approved',
          validated_by: 'parent-1',
        })
      );
    });

    it('throws on insert error', async () => {
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(insertChain);

      await expect(
        useMissionsStore.getState().parentDirectValidate('m-1', 'child-1', 'fam-1', 'parent-1')
      ).rejects.toThrow('Insert failed');
    });

    it('throws on update error', async () => {
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 's-new' }, error: null }),
      };
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(updateChain);

      await expect(
        useMissionsStore.getState().parentDirectValidate('m-1', 'child-1', 'fam-1', 'parent-1')
      ).rejects.toThrow('Update failed');
    });

    it('notifies child after direct validation', async () => {
      useMissionsStore.setState({
        missions: [{ id: 'm-1', title: 'Clean room', points_reward: 10 } as any],
      });

      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 's-new' }, error: null }),
      };
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const fetchSubsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(fetchSubsChain);

      const { notifyChild } = require('@/lib/notifications');
      await useMissionsStore.getState().parentDirectValidate('m-1', 'child-1', 'fam-1', 'parent-1');
      expect(notifyChild).toHaveBeenCalledWith(
        'child-1',
        'fam-1',
        'Mission validee',
        expect.stringContaining('Clean room'),
        'mission_validated',
        expect.any(Object)
      );
    });
  });
});
