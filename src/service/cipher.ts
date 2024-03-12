import { concatUnit8 } from '@/utilities/arr';
import { wrapUint8 } from '@/utilities/convert';
import sodium from 'libsodium-wrappers';

export const PBKDF_ITERATION_TIMES = 500000;
export const SALT_LENGTH = 16;

class SodiumCipher {
  async encrypt(str: Uint8Array | string, key: Uint8Array | string) {
    str = wrapUint8(str);
    key = wrapUint8(key);

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const salt = sodium.randombytes_buf(SALT_LENGTH);

    const encKey = await deriveHkdf(key, 32, 'Enc', salt);
    const hmacKey = await deriveHkdf(key, 32, 'Auth', salt);

    const enc = sodium.crypto_secretbox_easy(str, nonce, encKey);

    const hmac = await this.hmac(concatUnit8(nonce, salt, enc), hmacKey);

    return concatUnit8(nonce, salt, enc, hmac);
  }

  async hmac(
    message: Uint8Array | string,
    key: Uint8Array | string
  ) {
    return sodium.crypto_generichash(
      64,
      message,
      key
    );
  }
}

export const sodiumCipher = new SodiumCipher();

/**
 * PBKDF
 */
export async function derivePbkdf2(
  password: Uint8Array | string,
  salt: Uint8Array | string = '',
  iterations = 100000
) {
  password = wrapUint8(password);
  salt = wrapUint8(salt);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    password,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey',]
  );

  const ck = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt: salt || sodium.randombytes_buf(32)
    },
    baseKey,
    256,
  );

  return new Uint8Array(ck);
}

export async function deriveHkdf(
  key: Uint8Array | string,
  length = 0,
  info: Uint8Array | string = '',
  salt: Uint8Array | string = ''
) {
  key = wrapUint8(key);
  info = wrapUint8(info);
  salt = wrapUint8(salt);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    key,
    'HKDF',
    false,
    ['deriveBits', 'deriveKey',]
  );

  const ck = await window.crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      info,
      salt: salt || sodium.randombytes_buf(32)
    },
    baseKey,
    length * 8,
  );

  return new Uint8Array(ck);
}

export async function hmac(
  message: Uint8Array | string,
  key: Uint8Array | string
) {
  return sodium.crypto_generichash(
    64,
    message,
    key
  );
}
