import { wrapUint8 } from '@/utilities/convert';
import { hashPbkdf2 } from '@/utilities/crypto';

export const KEK_ITERATION_TIMES = 500000;
// export const SALT_LENGTH = 16;

export default new class EncryptionService {
  /**
   * Key Derivation Function (KDF)
   */
  async deriveKek(password: Uint8Array | string, salt: Uint8Array | string) {
    return hashPbkdf2('SHA-256', password, salt, KEK_ITERATION_TIMES, 32);
  }
}
