import router from '@/router';
import { accessTokenStorage, refreshTokenStorage, userStorage } from '@/store/main-store';

export default new class UserService {
  logoutAndRedirect() {
    userStorage.value = undefined;
    accessTokenStorage.value = '';
    refreshTokenStorage.value = '';

    router.replace({ name: 'login' });
  }
}
