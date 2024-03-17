import { Account, User } from '@/types';
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { computed, reactive } from 'vue';

export const mainStore = reactive<{
  user?: User;
}>({
  user: undefined,
});

export const accessTokenStorage = useLocalStorage('@authman:access.token', '');
export const refreshTokenStorage = useLocalStorage('@authman:refresh.token', '');
export const userStorage = useLocalStorage<User | undefined>(
  '@authman:user',
  undefined,
  {
    serializer: StorageSerializers.object
  }
);
export const isLogin = computed(() => accessTokenStorage.value !== '');

export const encSecretStorage = useLocalStorage('@authman:enc.secret', '');
export const encMasterStorage = useLocalStorage('@authman:enc.master', '');
export const kekStorage = useLocalStorage('@authman:kek', '');

export const accountsStorage = useLocalStorage<Account[]>('@authman:accounts', []);
