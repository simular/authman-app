import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import userService from '@/service/user-service';
import { accessTokenStorage, kekStorage, refreshTokenStorage } from '@/store/main-store';
import { User } from '@/types';
import { base64UrlDecode, base64UrlEncode, uint82text } from '@/utilities/convert';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import { hexToBigint, SRPClient } from '@windwalker-io/srp';
import { AxiosError } from 'axios';
import { bigintToUint8 } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers-sumo';

export interface LoginStep1Result {
  A: bigint,
  M1: bigint,
  S: bigint
}

export default new class AuthService {
  async login(email: string, password: string) {
    const { salt, B, sess, firstLogin } = await this.challenge(email);

    const data = await this.authenticate(
      email,
      password,
      sess,
      hexToBigint(salt),
      hexToBigint(B),
      firstLogin
        ? async (data, kek, { S }) => {
          const {
            encSecret,
            encMaster,
          } = await this.generateUserSecrets(kek);

          const keyS = S.toString();

          data.encSecret = base64UrlEncode(await sodiumCipher.encrypt(encSecret, keyS));
          data.encMaster = base64UrlEncode(await sodiumCipher.encrypt(encMaster, keyS));
        }
        : undefined,
    );

    kekStorage.value = secretToolkit.encode(
      data.kek,
      Encoder.HEX,
    );

    const S = data.S.toString();
    const saltHex = 'hex:' + salt;

    await userService.storeUserSecrets(
      data.user,
      saltHex,
      data.kek,
      uint82text(await sodiumCipher.decrypt(base64UrlDecode(data.encSecret), S)),
      uint82text(await sodiumCipher.decrypt(base64UrlDecode(data.encMaster), S)),
    );

    accessTokenStorage.value = data.accessToken;
    refreshTokenStorage.value = data.refreshToken;

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
    extra?: (data: any, kek: Uint8Array, step1Result: LoginStep1Result) => any,
  ) {
    const loginResult = await this.runSRPLoginSteps(email, password, salt, B);
    const { A, M1, S } = loginResult;

    let data: any = {
      email,
      A: A.toString(16),
      M1: M1.toString(16),
      sess,
    };

    let kek: Uint8Array | undefined = undefined;

    if (extra) {
      kek = await encryptionService.deriveKek(password, bigintToUint8(salt));
      data = (await extra(data, kek, loginResult)) || data;
    }

    const res = await this.authenticatePost(data);

    kek = kek || await encryptionService.deriveKek(password, bigintToUint8(salt));

    return {
      ...res.data.data,
      kek,
      S,
    };
  }

  async authenticateForPasswordChange(
    email: string,
    password: string,
    sess: string,
    salt: bigint,
    B: bigint,
  ) {
    const { A, M1, S } = await this.runSRPLoginSteps(email, password, salt, B);

    const data: any = {
      email,
      A: A.toString(16),
      M1: M1.toString(16),
      sess,
    };

    try {
      const res = await this.authenticatePost(data);

      return { A, M2: res.data.data.proof, S };
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e?.response?.data.code === 40103) {
          throw new Error('Invalid password.');
        }
      }

      throw e;
    }
  }

  async generateUserSecrets(kek: Uint8Array) {
    const secretKey = sodium.randombytes_buf(16);
    const masterKey = sodium.randombytes_buf(32);

    const encSecret = base64UrlEncode(await sodiumCipher.encrypt(secretKey, kek));
    const encMaster = base64UrlEncode(await sodiumCipher.encrypt(masterKey, secretKey));

    return {
      encSecret,
      encMaster,
    };
  }

  async runSRPLoginSteps(
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

  async authenticatePost(data: any) {
    return apiClient.post<{
      data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        key: string;
        proof: string;
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
