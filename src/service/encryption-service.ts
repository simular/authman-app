import { concatUnit8 } from '@/utilities/arr';
import { bigintToUint8, bufferToUint8, uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export const PBKDF_ITERATION_TIMES = 500000;
export const SALT_LENGTH = 16;

export default new class EncryptionService {
  async encrypt(str: string | Uint8Array, key: Uint8Array) {
    if (typeof str === 'string') {
      str = new TextEncoder().encode(str);
    }

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const salt = sodium.randombytes_buf(SALT_LENGTH);

    const encKey = await this.deriveEncKey(key, salt);

    const enc = sodium.crypto_secretbox_easy(str, nonce, encKey);

    return concatUnit8(nonce, salt, enc);
  }

  async deriveEncKey(originKey: Uint8Array, salt?: Uint8Array) {
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      originKey,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey',]
    );

    const ck = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations: PBKDF_ITERATION_TIMES,
        salt: salt || sodium.randombytes_buf(32)
      },
      baseKey,
      256,
    );

    return new Uint8Array(ck);
  }
}
