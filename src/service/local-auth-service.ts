import encryptionService from '@/service/encryption-service';
import userService from '@/service/user-service';
import { electronSecureStorage } from '@/storage/secure-storage';
import { isElectron, saltStorage } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { wrapUint8 } from '@/utilities/convert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import {
  AndroidBiometryStrength,
  AuthenticateOptions,
  BiometricAuth,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { KeychainAccess, SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

/**
 * Class to handle local password & biometrics authentication.
 */
export default new class {
  secureKekStorageKey = '@authman:secure.kek';

  async getKek() {
    if (isElectron.value) {
      return electronSecureStorage.getItem(this.secureKekStorageKey);
    }

    return (await SecureStorage.get(this.secureKekStorageKey)) as string | null;
  }

  async storeKek(kek: string) {
    if (isElectron.value) {
      return electronSecureStorage.setItem(this.secureKekStorageKey, kek);
    }

    await SecureStorage.set(
      this.secureKekStorageKey,
      kek,
      undefined,
      false,
      KeychainAccess.whenPasscodeSetThisDeviceOnly,
    );
  }

  async clearKek() {
    if (isElectron.value) {
      await electronSecureStorage.removeItem(this.secureKekStorageKey);
      return true;
    }

    return SecureStorage.remove(this.secureKekStorageKey, false);
  }

  async auth() {
    if (enableBiometricsOption.value) {
      await this.biometricsAuthenticate();

      return (await this.getKek()) || false;
    } else {
      return await this.askAndValidatePassword();
    }
  }

  async askAndValidatePassword(
    header?: string,
    message?: string,
  ) {
    header = header || 'Your Password';
    message = message || 'Please enter master password again.';

    const password = await userService.askPassword(header, message);

    if (!password) {
      return false;
    }

    return await this.validatePasswordAndGetKek(password);
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

  getBiometricsInfo() {
    return BiometricAuth.checkBiometry();
  }

  async isBiometricsAvailable() {
    if (isElectron.value) {
      return window.electronApi.canPromptTouchID();
    }

    const info = await this.getBiometricsInfo();

    return info.isAvailable;
  }

  async biometricsAuthenticate(options: AuthenticateOptions = {}) {
    if (isElectron.value) {
      return window.electronApi.promptTouchID('Please authenticate');
    }

    if (!Capacitor.isNativePlatform()) {
      // web simulate
      await BiometricAuth.setBiometryType(BiometryType.touchId);
      await BiometricAuth.setBiometryIsEnrolled(true);
      await BiometricAuth.setDeviceIsSecure(true);
    }

    if (!await this.isBiometricsAvailable()) {
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
      ...options
    });
  }
}

