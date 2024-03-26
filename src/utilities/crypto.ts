import { wrapUint8 } from '@/utilities/convert';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import sodium from 'libsodium-wrappers-sumo';

export async function hashPbkdf2(
  algo: string,
  password: Uint8Array | string,
  salt: Uint8Array | string,
  iterations: number,
  length = 0
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
      hash: algo,
      iterations,
      salt
    },
    baseKey,
    length * 8,
  );

  return new Uint8Array(ck);
}

export async function hashHkdf(
  algo: string,
  key: Uint8Array | string,
  length = 0,
  info: Uint8Array | string,
  salt: Uint8Array | string,
) {
  key = wrapUint8(key);
  info = wrapUint8(info);
  salt = wrapUint8(salt);

  if (algo.replace(/-/, '').toLowerCase() !== 'sha256') {
    throw new Error('Currently HKDF only support SHA-256');
  }

  return hkdf(sha256, key, salt, info, length);
}
