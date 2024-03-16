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

export function base64UrlEncode(str: Uint8Array | string) {
  if (typeof str !== 'string') {
    str = uint82text(str);
  }

  const base64 = btoa(str);

  return base64
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function base64UrlDecode(base64: string) {
  return atob(
    base64.replace(/-/g, "+")
      .replace(/_/g, "/")
  );
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
