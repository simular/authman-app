import { concatUnit8 } from '@/utilities/arr';
import { hashPbkdf2 } from '@/utilities/crypto';
import { bigintToUint8, bufferToUint8, uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export const PBKDF_ITERATION_TIMES = 500000;
export const SALT_LENGTH = 16;

export default new class EncryptionService {
  /**
   * Key Derivation Function (KDF)
   */
  async deriveEncKey(password: Uint8Array, salt?: Uint8Array | string) {
    salt = salt || sodium.randombytes_buf(SALT_LENGTH);

    return hashPbkdf2('SHA-256', password, salt, PBKDF_ITERATION_TIMES, 256);
  }
}
