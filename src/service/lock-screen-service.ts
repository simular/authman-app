import router from '@/router';
import encryptionService from '@/service/encryption-service';
import { isLock, isManuallyLock, kekStorage, saltStorage } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { simpleAlert } from '@/utilities/alert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { timingSafeEquals } from '@windwalker-io/srp';

export default new class {
  async lock() {
    isLock.value = true;

    router.replace({ name: 'lock' });
  }

  async unlock() {
    isLock.value = false;
    isManuallyLock.value = false;
  }

  async passwordAuthenticate(password: string) {
    const kek = secretToolkit.encode(
      await encryptionService.deriveKek(password, saltStorage.value),
      Encoder.HEX
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
}

