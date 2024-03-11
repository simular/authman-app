export function text2uint8(str: string) {
  return new TextEncoder().encode(str);
}

export function uint82text(uint: Uint8Array) {
  return new TextDecoder().decode(uint);
}
