import { concatUnit8 } from '@/utilities/arr';
import { uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export default new class EncryptionService {
  encrypt(str: string, key: string) {
    // const nonce = sodium.randombytes_buf(24);
    // const salt = sodium.randombytes_buf(32);

    const k = sodium.from_hex(key);

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const salt = sodium.randombytes_buf(32);

    const saltStr = new TextDecoder().decode(salt);

    const encKey = sodium.crypto_generichash(32, saltStr + ':ENC', k);
    const hmacKey = sodium.crypto_generichash(32, saltStr + ':AUTH', k);

    const enc = sodium.crypto_secretbox_easy(str, nonce, encKey);

    const hmac = sodium.crypto_generichash(
      64,
      concatUnit8(salt, nonce, enc),
      hmacKey
    );

    return uint8ToHex(concatUnit8(salt, nonce, enc, hmac));
  }
}
