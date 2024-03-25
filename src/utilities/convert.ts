import { hexToUint8 } from 'bigint-toolkit';
import { base64_variants, from_base64, to_base64 } from 'libsodium-wrappers-sumo';

export function text2uint8(str: string) {
  return new TextEncoder().encode(str);
}

export function uint82text(uint: Uint8Array) {
  return new TextDecoder().decode(uint);
}

export function wrapUint8(val: Uint8Array | string) {
  if (typeof val === 'string') {
    return text2uint8(val);
  }

  return val;
}

export function base64UrlEncode(str: Uint8Array | string, noPadding = false) {
  return to_base64(str, noPadding ? base64_variants.URLSAFE_NO_PADDING : base64_variants.URLSAFE);
}

export function base64UrlDecode(base64: string, noPadding = false) {
  return from_base64(base64, noPadding ? base64_variants.URLSAFE_NO_PADDING : base64_variants.URLSAFE);
}

function padString(input: string): string {
  let segmentLength = 4;
  let stringLength = input.length;
  let diff = stringLength % segmentLength;

  if (!diff) {
    return input;
  }

  let position = stringLength;
  let padLength = segmentLength - diff;
  let paddedStringLength = stringLength + padLength;
  let buffer = Buffer.alloc(paddedStringLength);

  buffer.write(input);

  while (padLength--) {
    buffer.write("=", position++);
  }

  return buffer.toString();
}

export async function blobToBase64Uri(blob: Blob): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
