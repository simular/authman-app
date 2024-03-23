import { sodiumCipher } from '@/service/cipher';
import { encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { base64UrlDecode } from '@/utilities/convert';
import { hashPbkdf2 } from '@/utilities/crypto';
import secretToolkit from '@/utilities/secret-toolkit';
import { uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export const KEK_ITERATION_TIMES = 500000;
// export const SALT_LENGTH = 16;

export default new class EncryptionService {
  /**
   * Key Derivation Function (KDF)
   */
  async deriveKek(password: Uint8Array | string, salt: Uint8Array | string) {
    return hashPbkdf2('SHA-256', password, salt, KEK_ITERATION_TIMES, 32);
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

    kek = kek || secretToolkit.decode(kekStorage.value);

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
