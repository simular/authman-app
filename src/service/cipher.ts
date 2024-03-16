import { concatUnit8 } from '@/utilities/arr';
import { uint82text, wrapUint8 } from '@/utilities/convert';
import { hashHkdf, hashPbkdf2 } from '@/utilities/crypto';
import { uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

class SodiumCipher {
  SALT_SIZE = 16;
  HKDF_SIZE = 32;
  HMAC_SIZE = 64;

  get NONCE_SIZE() {
    return sodium.crypto_secretbox_NONCEBYTES
  }

  async encrypt(str: Uint8Array | string, key: Uint8Array | string) {
    str = wrapUint8(str);
    key = wrapUint8(key);

    const nonce = sodium.randombytes_buf(this.NONCE_SIZE);
    const salt = sodium.randombytes_buf(this.SALT_SIZE);

    const encKey = await this.deriveHkdf(key, 'Enc', salt);
    const hmacKey = await this.deriveHkdf(key, 'Auth', salt);

    const enc = sodium.crypto_secretbox_easy(str, nonce, encKey);

    const hmac = await this.hmac(concatUnit8(nonce, salt, enc), hmacKey);

    return concatUnit8(nonce, salt, enc, hmac);
  }

  async hmac(
    message: Uint8Array | string,
    key: Uint8Array | string
  ) {
    return sodium.crypto_generichash(
      this.HMAC_SIZE,
      message,
      key
    );
  }

  deriveHkdf(
    key: Uint8Array | string,
    info: Uint8Array | string = '',
    salt: Uint8Array | string = ''
  ) {
    return hashHkdf('SHA-256', key, this.HKDF_SIZE, info, salt);
  }
}

class SignatureCipher {
  seal(str: Uint8Array | string, key: Uint8Array | string) {
    str = wrapUint8(str);
    key = wrapUint8(key);

    return sodium.crypto_box_seal(str, key);
  }
}

export const sodiumCipher = new SodiumCipher();
