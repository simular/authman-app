import encryptionService from '@/service/encryption-service';
import userService from '@/service/user-service';
import { isLock, kekStorage, noInstantUnlock, saltStorage } from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { KeychainAccess, SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import idleTimeout from 'idle-timeout';
import IdleTimeout from 'idle-timeout/dist/IdleTimeout';

const IDLE_TIMEOUT = (Number(import.meta.env.VITE_IDLE_TIMEOUT) || (5 * 60)) * 1000;

export default new class {
  idleInstance?: IdleTimeout;

  async handleBeforeLock() {
    isLock.value = true;
    kekStorage.value = '';
    const idleInstance = this.getIdleInstance();
    idleInstance.pause();
  }

  async unlock() {
    isLock.value = false;
    noInstantUnlock.value = false;

    const idleInstance = this.getIdleInstance();
    idleInstance.reset();
    idleInstance.resume();
  }

  async validatePasswordAndGetKek(password: string) {
    const kek = await encryptionService.deriveKek(
      password,
      secretToolkit.decode(saltStorage.value)
    );

    try {
      await encryptionService.getSecretKey(kek);

      return secretToolkit.encode(kek, Encoder.HEX);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async passwordAuthenticate(password: string) {
    const kek = await this.validatePasswordAndGetKek(password);

    if (!kek) {
      throw new Error('Invalid password');
    }

    return kek;
  }

  async testBiometrics() {
    try {
      await this.biometricsAuthenticate();

      const password = await userService.askPassword(
        'Your Password',
        'Please enter master password again.'
      );

      if (!password) {
        return false;
      }

      const kek = await this.validatePasswordAndGetKek(password);

      if (!kek) {
        simpleAlert('Invalid Password');
        return false;
      }

      await SecureStorage.set(
        '@authman:secure.kek',
        kek,
        undefined,
        false,
        KeychainAccess.whenPasscodeSetThisDeviceOnly,
      );

      return true;
    } catch (e) {
      if (e instanceof Error) {
        simpleAlert(e.message);
      }

      return false;
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
    console.log(info);
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
        if (isLock.value) {
          return;
        }

        console.log('Idle timeout, lock screen.');

        noInstantUnlock.value = true;

        this.handleBeforeLock();
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
