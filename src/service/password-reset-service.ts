import apiClient from '@/service/api-client';
import { LoginStep1Result } from '@/service/auth-service';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { srpClient } from '@/service/srp';
import userService from '@/service/user-service';
import { ApiReturn, User } from '@/types';
import { base64UrlDecode, base64UrlEncode, uint82text } from '@/utilities/convert';
import { bigintToHex, bigintToUint8, hexToUint8 } from 'bigint-toolkit';

export default new class {
  async challenge(email: string, password: string) {
    const client = srpClient();

    const { salt, verifier } = await client.register(email, password);

    const res = await apiClient.post<ApiReturn<{
      B: string;
      sess: string;
    }>>(
      'password/challenge',
      {
        salt: salt.toString(16),
        verifier: verifier.toString(16),
      },
    );

    return {
      ...res.data.data,
      salt,
      verifier,
    };
  }

  async reset(
    email: string,
    password: string,
    sess: string,
    salt: bigint,
    verifier: bigint,
    B: bigint,
    secret: Uint8Array,
    master: Uint8Array,
  ) {
    const loginResult = await this.runSRPClientSteps(email, password, salt, B);
    const { A, M1, S } = loginResult;

    const saltHex = bigintToHex(salt);
    const saltUint8 = hexToUint8(saltHex);

    const kek = await encryptionService.deriveKek(password, saltUint8);

    const keyS = S.toString();

    // Use new KEK to encrypt secret & master and save to server
    const { encSecret, encMaster } = await this.encryptSecrets(kek, secret, master);

    let data: any = {
      email,
      salt: salt.toString(16),
      verifier: verifier.toString(16),
      A: A.toString(16),
      M1: M1.toString(16),
      sess,
      encSecret: base64UrlEncode(await sodiumCipher.encrypt(encSecret, keyS)),
      encMaster: base64UrlEncode(await sodiumCipher.encrypt(encMaster, keyS)),
    };

    await this.validateEncryptedSecretAndMaster(kek, data.encSecret, data.encMaster, keyS);

    const res = await apiClient.post<ApiReturn<{
      user: User;
    }>>('password/reset', data);

    await userService.storeUserSecrets(
      res.data.data.user,
      bigintToUint8(salt),
      kek,
      encSecret,
      encMaster,
    );
  }

  async runSRPClientSteps(
    email: string,
    password: string,
    salt: bigint,
    B: bigint,
  ): Promise<LoginStep1Result> {
    const client = srpClient();

    const { secret: a, public: A, hash: x } = await client.step1(
      email,
      password,
      salt,
    );

    const { key: K, proof: M1, preMasterSecret: S } = await client.step2(
      email,
      salt,
      A,
      a,
      B,
      x,
    );

    return { A, M1, S };
  }

  async encryptSecrets(kek: Uint8Array, secretKey: Uint8Array, masterKey: Uint8Array) {
    // Use new KEK to encrypt secret & master and save to server
    const encSecret = base64UrlEncode(await sodiumCipher.encrypt(secretKey, kek));
    const encMaster = base64UrlEncode(await sodiumCipher.encrypt(masterKey, secretKey));

    return { encSecret, encMaster };
  }

  async validateEncryptedSecretAndMaster(
    kek: Uint8Array,
    encSecret: string,
    encMaster: string,
    keyS: string,
  ) {
    const secret = await sodiumCipher.decrypt(base64UrlDecode(encSecret), keyS);
    const master = await sodiumCipher.decrypt(base64UrlDecode(encMaster), keyS);

    return encryptionService.decryptSecretAndMaster(uint82text(secret), uint82text(master), kek);
  }
};
