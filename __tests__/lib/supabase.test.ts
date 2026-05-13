jest.unmock('@/lib/supabase');

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

let capturedAdapter: any = null;

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn((_url: string, _key: string, options: any) => {
    capturedAdapter = options?.auth?.storage;
    return {
      auth: {
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(),
    };
  }),
}));

import * as SecureStore from 'expo-secure-store';

describe('supabase lib', () => {
  let supabaseModule: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-require to capture the adapter
    jest.isolateModules(() => {
      supabaseModule = require('@/lib/supabase');
    });
  });

  it('exports supabase client', () => {
    expect(supabaseModule.supabase).toBeDefined();
  });

  it('exports skipAuthStateChange as false by default', () => {
    expect(supabaseModule.skipAuthStateChange).toBe(false);
  });

  it('setSkipAuthStateChange toggles the flag', () => {
    expect(supabaseModule.skipAuthStateChange).toBe(false);
    supabaseModule.setSkipAuthStateChange(true);
    expect(supabaseModule.skipAuthStateChange).toBe(true);
    supabaseModule.setSkipAuthStateChange(false);
    expect(supabaseModule.skipAuthStateChange).toBe(false);
  });

  describe('ExpoSecureStoreAdapter', () => {
    it('getItem returns null for missing key', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const result = await capturedAdapter.getItem('testKey');
      expect(result).toBeNull();
    });

    it('getItem returns simple value', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('simpleValue');
      const result = await capturedAdapter.getItem('testKey');
      expect(result).toBe('simpleValue');
    });

    it('getItem reassembles chunked values', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('__chunked__:2')
        .mockResolvedValueOnce('chunk0')
        .mockResolvedValueOnce('chunk1');
      const result = await capturedAdapter.getItem('testKey');
      expect(result).toBe('chunk0chunk1');
    });

    it('getItem returns null if a chunk is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('__chunked__:2')
        .mockResolvedValueOnce('chunk0')
        .mockResolvedValueOnce(null);
      const result = await capturedAdapter.getItem('testKey');
      expect(result).toBeNull();
    });

    it('setItem stores small values directly', async () => {
      await capturedAdapter.setItem('testKey', 'small');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey', 'small');
    });

    it('setItem chunks large values', async () => {
      const largeValue = 'x'.repeat(3000); // > 2000 CHUNK_SIZE
      await capturedAdapter.setItem('testKey', largeValue);
      // Should store __chunked__:2 marker + 2 chunks
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey', '__chunked__:2');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey_chunk_0', largeValue.substring(0, 2000));
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey_chunk_1', largeValue.substring(2000));
    });

    it('removeItem deletes simple values', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('simpleValue');
      await capturedAdapter.removeItem('testKey');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
    });

    it('removeItem deletes chunked values and marker', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('__chunked__:2');
      await capturedAdapter.removeItem('testKey');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey_chunk_0');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey_chunk_1');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
    });
  });
});
