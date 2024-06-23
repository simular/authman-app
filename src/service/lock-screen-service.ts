import events, { LockScreenEvent } from '@/service/events';
import localAuthService from '@/service/local-auth-service';
import userService from '@/service/user-service';
import {
  isLock,
  IDLE_TIMEOUT,
  kekStorage,
  noInstantUnlock,
  idleTimeoutEnabled, isLogin,
} from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import { alertController, modalController } from '@ionic/vue';
import idleTimeout from 'idle-timeout';
import type IdleTimeout from 'idle-timeout/dist/IdleTimeout';

export default new class {
  idleInstance?: IdleTimeout;

  async handleBeforeLock() {
    isLock.value = true;
    kekStorage.value = '';

    this.stopListen();
  }

  async lock() {
    await this.handleBeforeLock();

    // Dismiss modal and others
    modalController.dismiss();
    alertController.dismiss();

    events.emit(LockScreenEvent);
  }

  async unlock() {
    isLock.value = false;
    noInstantUnlock.value = false;

    this.listenIdleTimeout();
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

    console.log('Listen idle-timeout');

    const idleInstance = this.getIdleInstance();
    idleInstance.reset();
    idleInstance.resume();
  }

  stopListen() {
    if (!idleTimeoutEnabled) {
      return;
    }

    console.log('Stop listen idle-timeout');

    const idleInstance = this.getIdleInstance();
    idleInstance.reset();
    idleInstance.resume();
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
