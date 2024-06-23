import lockScreenService from '@/service/lock-screen-service';
import { isLock, isLogin } from '@/store/main-store';

export async function pageInit() {
  if (!isLogin.value) {
    return { name: 'login' };
  }
  if (isLock.value) {
    return { name: 'lock' };
  }
}
