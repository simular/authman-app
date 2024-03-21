import { sodiumCipher } from '@/service/cipher';
import { encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { base64UrlDecode } from '@/utilities/convert';
import { hashPbkdf2 } from '@/utilities/crypto';
import secretToolkit from '@/utilities/secret-toolkit';
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

  async getMasterKey() {
    await sodium.ready;

    const kek = kekStorage.value;
    const secret = await sodiumCipher.decrypt(base64UrlDecode(encSecretStorage.value), secretToolkit.decode(kek));

    return await sodiumCipher.decrypt(base64UrlDecode(encMasterStorage.value), secret);
  }
}
