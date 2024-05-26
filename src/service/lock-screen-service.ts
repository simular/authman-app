import events, { LockScreenEvent } from '@/service/events';
import localAuthService from '@/service/local-auth-service';
import userService from '@/service/user-service';
import {
  isLock,
  IDLE_TIMEOUT,
  kekStorage,
  noInstantUnlock,
  idleTimeoutEnabled,
} from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import idleTimeout from 'idle-timeout';
import type IdleTimeout from 'idle-timeout/dist/IdleTimeout';

export default new class {
  idleInstance?: IdleTimeout;

  async handleBeforeLock() {
    isLock.value = true;
    kekStorage.value = '';
    const idleInstance = this.getIdleInstance();
    idleInstance.pause();
  }

  async lock() {
    await this.handleBeforeLock();

    events.emit(LockScreenEvent);
  }

  async unlock() {
    isLock.value = false;
    noInstantUnlock.value = false;

    const idleInstance = this.getIdleInstance();
    idleInstance.reset();
    idleInstance.resume();
  }

  async passwordAuthenticate(password: string) {
    const kek = await localAuthService.validatePasswordAndGetKek(password);

    if (!kek) {
      throw new Error('Invalid password');
    }

    return kek;
  }

  async testBiometricsAndStoreKek() {
    try {
      await localAuthService.biometricsAuthenticate();

      const password = await userService.askPassword(
        'Your Password',
        'Please enter master password again.',
      );

      if (!password) {
        return false;
      }

      const kek = await localAuthService.validatePasswordAndGetKek(password);

      if (!kek) {
        simpleAlert('Invalid Password');
        return false;
      }

      await localAuthService.storeKek(kek);

      return true;
    } catch (e) {
      if (e instanceof Error) {
        simpleAlert(e.message);
      }

      return false;
    }
  }

  listenIdleTimeout() {
    if (!idleTimeoutEnabled) {
      return;
    }

    const instance = this.getIdleInstance();

    instance.reset();
    instance.resume();
  }

  getIdleInstance() {
    return this.idleInstance = this.idleInstance || idleTimeout(
      () => {
        if (isLock.value) {
          return;
        }

        console.log('Idle timeout, lock screen.');

        noInstantUnlock.value = true;

        this.lock();
      },
      {
        element: document.body,
        timeout: IDLE_TIMEOUT,
        loop: false,
      },
    );
  }

  routerLock() {
    //
  }
};
