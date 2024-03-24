import router from '@/router';
import encryptionService from '@/service/encryption-service';
import { isLock, noInstantUnlock, kekStorage, saltStorage } from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { timingSafeEquals } from '@windwalker-io/srp';
import idleTimeout from 'idle-timeout';
import IdleTimeout from 'idle-timeout/dist/IdleTimeout';

const IDLE_TIMEOUT = (Number(import.meta.env.VITE_IDLE_TIMEOUT) || (5 * 60)) * 1000;

export default new class {
  idleInstance?: IdleTimeout;

  async lock() {
    isLock.value = true;
    const idleInstance = this.getIdleInstance();
    idleInstance.pause();

    router.replace({ name: 'lock' });
  }

  async unlock() {
    isLock.value = false;
    noInstantUnlock.value = false;

    const idleInstance = this.getIdleInstance();
    idleInstance.reset();
    idleInstance.resume();
  }

  async passwordAuthenticate(password: string) {
    const kek = secretToolkit.encode(
      await encryptionService.deriveKek(password, saltStorage.value),
      Encoder.HEX,
    );

    if (!timingSafeEquals(kekStorage.value, kek)) {
      throw new Error('Invalid password');
    }
  }

  async testBiometrics() {
    try {
      await this.biometricsAuthenticate();
    } catch (e) {
      if (e instanceof Error) {
        simpleAlert(e.message);
      }
    }
  }

  async biometricsAuthenticate() {
    if (!Capacitor.isNativePlatform()) {
      // web simulate
      await BiometricAuth.setBiometryType(BiometryType.touchId);
      await BiometricAuth.setBiometryIsEnrolled(true);
      await BiometricAuth.setDeviceIsSecure(true);
    }

    const info = await BiometricAuth.checkBiometry();

    if (!info.isAvailable) {
      throw new Error('Touch ID or Face ID not available.');
    }

    await BiometricAuth.authenticate({
      reason: 'Please authenticate',
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use password',
      androidTitle: 'Biometric login',
      androidSubtitle: 'Log in using biometric authentication',
      androidConfirmationRequired: true,
      androidBiometryStrength: AndroidBiometryStrength.weak,
    });
  }

  listenIdleTimeout() {
    this.getIdleInstance();
  }

  getIdleInstance() {
    return this.idleInstance = this.idleInstance || idleTimeout(
      () => {
        // if (isLock.value) {
        //   return;
        // }

        console.log('Idle timeout, lock screen.');

        noInstantUnlock.value = true;

        this.lock();
      },
      {
        element: document.body,
        timeout: IDLE_TIMEOUT,
        loop: false
      }
    );
  }

  routerLock() {
    //
  }
};
