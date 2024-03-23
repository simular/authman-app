import router from '@/router';
import {
  accessTokenStorage,
  accountsLoaded,
  accountsStorage, encMasterStorage, encSecretStorage, kekStorage, mainStore,
  refreshTokenStorage,
  userStorage,
} from '@/store/main-store';

export default new class UserService {
  logoutAndRedirect() {
    userStorage.value = undefined;
    accessTokenStorage.value = '';
    refreshTokenStorage.value = '';

    accountsStorage.value = [];
    accountsLoaded.value = false;

    mainStore.user = undefined;
    mainStore.decryptedAccounts = [];

    this.clearSecrets();

    router.replace({ name: 'login' });
  }

  clearSecrets() {
    encSecretStorage.value = '';
    encMasterStorage.value = '';
    kekStorage.value = '';
  }
};
