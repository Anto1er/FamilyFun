// This test file has its own supabase mock - does NOT use jest.setup.js mock
jest.unmock('@/lib/supabase');
jest.unmock('@/lib/notifications');

jest.mock('@/lib/supabase', () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: null, error: null }),
  };
  return {
    supabase: {
      from: jest.fn(() => mockChain),
    },
    __mockChain: mockChain,
  };
});

// Mock global fetch
global.fetch = jest.fn().mockResolvedValue({ ok: true });

import { sendPushNotification, notifyParents, notifyChild } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
});

describe('notifications', () => {
  describe('sendPushNotification', () => {
    it('sends POST request to expo push API', async () => {
      await sendPushNotification('ExponentPushToken[abc]', 'Hello', 'World', { key: 'val' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            to: 'ExponentPushToken[abc]',
            sound: 'default',
            title: 'Hello',
            body: 'World',
            data: { key: 'val' },
          }),
        })
      );
    });

    it('sends with empty data when none provided', async () => {
      await sendPushNotification('ExponentPushToken[abc]', 'Title', 'Body');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          body: JSON.stringify({
            to: 'ExponentPushToken[abc]',
            sound: 'default',
            title: 'Title',
            body: 'Body',
            data: {},
          }),
        })
      );
    });
  });

  describe('notifyParents', () => {
    it('sends notifications to all parents with push tokens', async () => {
      const parents = [
        { id: 'p-1', expo_push_token: 'ExponentPushToken[p1]' },
        { id: 'p-2', expo_push_token: 'ExponentPushToken[p2]' },
      ];
      const selectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: parents }),
      };
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(selectChain) // profiles select
        .mockReturnValueOnce(insertChain) // notification insert for p-1
        .mockReturnValueOnce(insertChain) // notification insert for p-2
        ;

      await notifyParents('fam-1', 'Test Title', 'Test Body', 'mission_submitted', { screen: 'test' });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      // Push sent for both parents
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('returns early when no parents found', async () => {
      const selectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(selectChain);

      await notifyParents('fam-1', 'Title', 'Body');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('inserts notification but skips push when parent has no token', async () => {
      const parents = [{ id: 'p-1', expo_push_token: null }];
      const selectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: parents }),
      };
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(insertChain);

      await notifyParents('fam-1', 'Title', 'Body');
      // In-app notification created but no push sent
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('notifyChild', () => {
    it('sends notification and push to child with token', async () => {
      const childData = { expo_push_token: 'ExponentPushToken[child]' };
      const selectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: childData }),
      };
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(selectChain)  // profiles select
        .mockReturnValueOnce(insertChain); // notification insert

      await notifyChild('child-1', 'fam-1', 'Title', 'Body', 'mission_validated', { screen: 'test' });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('inserts notification but skips push when child has no token', async () => {
      const childData = { expo_push_token: null };
      const selectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: childData }),
      };
      const insertChain = {
        insert: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(insertChain);

      await notifyChild('child-1', 'fam-1', 'Title', 'Body', 'mission_validated');

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
