
export function concatUnit8(...items: Uint8Array[]) {
  const length = items.reduce(
    (len, item) => len + item.length,
    0
  );

  const result = new Uint8Array(length);
  let len = 0;

  for (const item of items) {
    result.set(item, len);
    len += item.length;
  }

  return result;
}
