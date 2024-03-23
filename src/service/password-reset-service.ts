import apiClient from '@/service/api-client';
import { LoginStep1Result } from '@/service/auth-service';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { ApiReturn } from '@/types';
import { base64UrlDecode, base64UrlEncode, uint82text } from '@/utilities/convert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import { SRPClient } from '@windwalker-io/srp';
import { bigintToUint8, uint8ToHex } from 'bigint-toolkit';

export default new class {
  async challenge(email: string, password: string) {
    const client = SRPClient.create();

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
      verifier
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

    const kek = await encryptionService.deriveKek(password, salt.toString());

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

    const res = await apiClient.post('password/reset', data);

    kekStorage.value = secretToolkit.encode(kek, Encoder.HEX);
    encSecretStorage.value = encSecret;
    encMasterStorage.value = encMaster;
  }

  async runSRPClientSteps(
    email: string,
    password: string,
    salt: bigint,
    B: bigint
  ): Promise<LoginStep1Result> {
    const srpClient = SRPClient.create();

    const { secret: a, public: A, hash: x } = await srpClient.step1(
      email,
      password,
      salt,
    );

    const { key: K, proof: M1, preMasterSecret: S } = await srpClient.step2(
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
