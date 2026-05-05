import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore-based storage adapter for Supabase Auth.
 * Falls back to in-memory if SecureStore is unavailable (web/SSR).
 *
 * SecureStore has 2KB per item limit; Supabase tokens fit comfortably (~1KB).
 */
export const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
