import { Account, User } from '@/types';
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

export const mainStore = reactive<{
  user?: User;
  decryptedAccounts: Account[];
}>({
  user: undefined,
  decryptedAccounts: []
});

export const accessTokenStorage = useLocalStorage('@authman:access.token', '');
export const refreshTokenStorage = useLocalStorage('@authman:refresh.token', '');
export const userStorage = useLocalStorage<User | null>(
  '@authman:user',
  null,
  {
    serializer: StorageSerializers.object
  }
);
export const isLogin = computed(() => accessTokenStorage.value !== '');

export const saltStorage = useLocalStorage('@authman:salt', '');
export const encSecretStorage = useLocalStorage('@authman:enc.secret', '');
export const encMasterStorage = useLocalStorage('@authman:enc.master', '');
export const kekStorage = useLocalStorage('@authman:kek', '');

export const accountsLoaded = useLocalStorage('@authman:accounts.loaded', false, {
  serializer: StorageSerializers.boolean
});
export const accountsStorage = useLocalStorage<Account<string>[]>('@authman:accounts', []);

// Lock
export const isLock = ref(true);
export const isManuallyLock = ref(false);
