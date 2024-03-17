import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { encMasterStorage, encSecretStorage } from '@/store/main-store';
import { User } from '@/types';
import { text2uint8 } from '@/utilities/convert';
import { hexToBigint, SRPClient } from '@windwalker-io/srp';
import { bigintToUint8, uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export default new class AuthService {
  async login(email: string, password: string) {
    const { salt, B, sess, firstLogin } = await this.challenge(email);

    const data = await this.authenticate(
      email,
      password,
      sess,
      hexToBigint(salt),
      hexToBigint(B),
      firstLogin,
    );

    encSecretStorage.value = data.encSecret;
    encMasterStorage.value = data.encMaster;

    return data;
  }

  async challenge(email: string) {
    const res = await apiClient.post(
      'auth/challenge',
      {
        email,
      },
    );

    return res.data.data as {
      salt: string;
      B: string;
      sess: string;
      firstLogin: boolean;
    };
  }

  async authenticate(
    email: string,
    password: string,
    sess: string,
    salt: bigint,
    B: bigint,
    firstLogin = false,
  ) {
    const { A, M1, S } = await this.runSRPLoginSteps(email, password, salt, B);

    let secrets: {
      encSecret?: string;
      encMaster?: string;
    } = {};

    if (firstLogin) {
      secrets = await this.generateUserSecrets(password, S, salt);
    }

    const res = await this.authenticatePost({
      email,
      A: A.toString(16),
      M1: M1.toString(16),
      sess,
      ...secrets,
    });

    return res.data.data;
  }

  async generateUserSecrets(
    password: string,
    S: bigint,
    salt: bigint
  ) {
    const uintS = bigintToUint8(S);

    const secretKey = sodium.randombytes_buf(16);
    const masterKey = sodium.randombytes_buf(32);
    const kek = await encryptionService.deriveKek(text2uint8(password), bigintToUint8(salt));

    const encSecret = await sodiumCipher.encrypt(secretKey, kek);
    const encMaster = await sodiumCipher.encrypt(masterKey, secretKey);

    return {
      encSecret: uint8ToHex(await sodiumCipher.encrypt(encSecret, uintS)),
      encMaster: uint8ToHex(await sodiumCipher.encrypt(encMaster, uintS)),
    };
  }

  async runSRPLoginSteps(email: string, password: string, salt: bigint, B: bigint) {
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

  async authenticatePost(data: any) {
    return apiClient.post<{
      data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        encSecret: string;
        encMaster: string;
      }
    }>(
      'auth/authenticate',
      data,
      {
        _noAuth: true,
      },
    );
  }
};
