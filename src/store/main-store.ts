import { getSecureStorage } from '@/storage/secure-storage';
import { Account, User } from '@/types';
import { Capacitor } from '@capacitor/core';
import { getPlatforms } from '@ionic/vue';
import { StorageSerializers, useLocalStorage, useStorage, useStorageAsync } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

export const mainStore = reactive<{
  user?: User;
  decryptedAccounts: Account[];
}>({
  user: undefined,
  decryptedAccounts: []
});

// Platform
export const currentPlatform = computed<string>(() => Capacitor.getPlatform());
export const currentPlatforms = ref<ReturnType<typeof getPlatforms>>([]);
export const isElectron = computed(() => currentPlatform.value === 'electron');
export const isWeb = computed(() => currentPlatform.value === 'web');
export const isMobile = computed(() => currentPlatforms.value.includes('mobile'));
export const isDesktop = computed(() => currentPlatforms.value.includes('desktop'));
export const isNative = computed(() => Capacitor.isNativePlatform());

// Env
export const lockAtStartup = import.meta.env.VITE_LOCK_SCREEN_AT_STARTUP === '1';

// Auth
export const accessTokenStorage = useStorageAsync('@authman:access.token', '', getSecureStorage());
export const refreshTokenStorage = useStorageAsync('@authman:refresh.token', '', getSecureStorage());
export const userStorage = useLocalStorage<User | null>(
  '@authman:user',
  null,
  {
    serializer: StorageSerializers.object
  }
);
export const isLogin = computed(() => userStorage.value != null);

// Keys
export const saltStorage = useStorageAsync('@authman:salt', '', getSecureStorage());
export const encSecretStorage = useStorageAsync('@authman:enc.secret', '', getSecureStorage());
export const encMasterStorage = useStorageAsync('@authman:enc.master', '', getSecureStorage());
export const kekStorage = lockAtStartup ? ref('') : useLocalStorage('@authman:kek', '');

export const accountsLoaded = useLocalStorage('@authman:accounts.loaded', false, {
  serializer: StorageSerializers.boolean
});
export const accountsStorage = useLocalStorage<Account<string>[]>('@authman:accounts', []);

// Lock
export const IDLE_TIMEOUT = (Number(import.meta.env.VITE_IDLE_TIMEOUT) || (5 * 60)) * 1000;
export const idleTimeoutEnabled = IDLE_TIMEOUT > 0;
export const isLock = ref((lockAtStartup && isLogin.value) || !kekStorage.value);
export const noInstantUnlock = ref(false);
