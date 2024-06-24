import { isElectron } from '@/store/main-store';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Awaitable, StorageLikeAsync } from '@vueuse/core';

class ElectronSecureStorage implements StorageLikeAsync {
  getItem(key: string): Awaitable<string | null> {
    return window.electronApi.storageGet(key);
  }

  removeItem(key: string): Awaitable<void> {
    return window.electronApi.storageRemove(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await window.electronApi.storageSet(key, value);
  }
}

export const electronSecureStorage = new ElectronSecureStorage();

export function getSecureStorage(): StorageLikeAsync {
  if (!isElectron.value) {
    return SecureStorage;
  }

  return electronSecureStorage;
}
