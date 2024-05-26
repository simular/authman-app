import { sodiumCipher } from '@/service/cipher';
import userService from '@/service/user-service';
import { encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { base64UrlDecode, wrapUint8 } from '@/utilities/convert';
import { hashPbkdf2 } from '@/utilities/crypto';
import secretToolkit from '@/utilities/secret-toolkit';
import { sleep } from '@/utilities/timing';
import { uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers-sumo';

// @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (2024)
// export const SALT_LENGTH = 16;

export default new class EncryptionService {
  /**
   * Key Derivation Function (KDF)
   */
  async deriveKek(password: Uint8Array | string, salt: Uint8Array | string) {
    password = wrapUint8(password);

    salt = wrapUint8(salt);

    return sodium.crypto_pwhash(
      32,
      password,
      salt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    );
  }

  async getSecretAndMaster(kek?: Uint8Array | string) {
    await sodium.ready;

    kek = kek || secretToolkit.decode(kekStorage.value);

    return this.decryptSecretAndMaster(
      encSecretStorage.value,
      encMasterStorage.value,
      kek
    );
  }

  async getMasterKeyBySecret(secret: Uint8Array | string) {
    await sodium.ready;

    return await sodiumCipher.decrypt(base64UrlDecode(encMasterStorage.value), secret);
  }

  async getMasterKey(kek?: Uint8Array | string) {
    await sodium.ready;

    try {
      kek = kek || secretToolkit.decode(kekStorage.value);
    } catch (e) {
      console.warn(
        'Invalid KEK, system auto logout',
        kekStorage.value
      );
      userService.logoutAndRedirect();
      throw e;
    }

    const secret = await sodiumCipher.decrypt(base64UrlDecode(encSecretStorage.value), kek);

    return await sodiumCipher.decrypt(base64UrlDecode(encMasterStorage.value), secret);
  }

  async getSecretKey(kek?: Uint8Array | string) {
    kek = kek || secretToolkit.decode(kekStorage.value);

    return await sodiumCipher.decrypt(base64UrlDecode(encSecretStorage.value), kek);
  }

  async decryptSecretAndMaster(encSecret: string, encMaster: string, kek: Uint8Array | string) {
    const secret = await sodiumCipher.decrypt(base64UrlDecode(encSecret), kek);
    const master = await sodiumCipher.decrypt(base64UrlDecode(encMaster), secret);

    return { secret, master };
  }
}
