import router from '@/router';
import {
  accessTokenStorage,
  accountsLoaded,
  accountsStorage,
  encMasterStorage,
  encSecretStorage,
  kekStorage,
  mainStore,
  refreshTokenStorage,
  saltStorage,
  userStorage,
} from '@/store/main-store';
import { User } from '@/types';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

export default new class UserService {
  async logoutAndRedirect() {
    accessTokenStorage.value = '';
    refreshTokenStorage.value = '';

    accountsStorage.value = [];
    accountsLoaded.value = false;

    mainStore.user = undefined;
    mainStore.decryptedAccounts = [];

    await this.clearUserSecrets();

    router.replace({ name: 'login' });
  }

  async storeUserSecrets(
    user: User,
    salt: string | Uint8Array,
    kek: string | Uint8Array,
    encSecret: string,
    encMaster: string
  ) {
    if (typeof salt === 'object') {
      salt = secretToolkit.encode(salt, Encoder.HEX);
    }

    if (typeof kek === 'object') {
      kek = secretToolkit.encode(kek, Encoder.HEX);
    }

    saltStorage.value = salt;
    kekStorage.value = kek;
    encSecretStorage.value = encSecret;
    encMasterStorage.value = encMaster;
    userStorage.value = user;
  }

  async clearUserSecrets() {
    encSecretStorage.value = '';
    encMasterStorage.value = '';
    kekStorage.value = '';
    saltStorage.value = '';
    userStorage.value = undefined;
  }
};
