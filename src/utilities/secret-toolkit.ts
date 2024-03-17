import {
  base64UrlDecode,
  base64UrlEncode,
  text2uint8,
  uint82text,
  wrapUint8,
} from '@/utilities/convert';
import { hexToUint8, uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export enum Encoder {
  HEX = 'hex',
  BASE64URL = 'base64url',
  RAW = 'raw',
}

export default new class {
  genSecret(length: number, encoder: Encoder = Encoder.BASE64URL) {
    const secret = sodium.randombytes_buf(length);

    return this.encode(secret, encoder, true);
  }

  encode(str: Uint8Array | string, encoder: Encoder = Encoder.BASE64URL, withPrefix = true) {
    str = wrapUint8(str);

    if (encoder === Encoder.RAW) {
      return uint82text(str);
    }

    let encoded: string;

    if (encoder === Encoder.HEX) {
      encoded = uint8ToHex(str);
    } else if (encoder === Encoder.BASE64URL) {
      encoded = base64UrlEncode(str);
    } else {
      throw new Error(`Unknown encoder: ${encoder}`);
    }

    if (withPrefix) {
      encoded = encoder + ':' + encoded;
    }

    return encoded;
  }

  decode(str: string) {
    const [encoder, encoded] = this.extract(str);

    if (encoder === Encoder.HEX) {
      return hexToUint8(encoded);
    }

    if (encoder === Encoder.BASE64URL) {
      return text2uint8(base64UrlDecode(encoded));
    }

    throw new Error(`Unknown encoder: ${encoder}`);
  }

  extract(str: string) {
    const extracted = str.split(':');

    if (extracted.length < 2) {
      throw new Error('Invalid secret string.');
    }

    return extracted as [string, string];
  }

  getEncoder(str: string) {
    if (!str.includes(':')) {
      return null;
    }

    const extracted = str.split(':');

    return extracted[0];
  }
}
