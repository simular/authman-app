
export function concatUnit8(...items: Uint8Array[]) {
  const length = items.reduce(
    (len, item) => len + item.length,
    0
  );

  const result = new Uint8Array(length);

  for (const item of items) {
    result.set(item);
  }

  return result;
}
