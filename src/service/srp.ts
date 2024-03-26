import { sha256 } from '@noble/hashes/sha256';
import { SRPClient, SRPServer } from '@windwalker-io/srp';

export function srpClient() {
  const client = SRPClient.create();

  // Set hasher function to use @noble/hashes since iOS not support browser SubtleCrypto now.
  client.setHasher(async (buffer, length) => {
    return sha256(buffer);
  });

  return client;
}

export function srpServer() {
  return SRPServer.create();
}
