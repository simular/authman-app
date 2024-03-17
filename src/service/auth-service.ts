import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { User } from '@/types';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import { hexToBigint, SRPClient } from '@windwalker-io/srp';
import { bigintToUint8, uint8ToHex } from 'bigint-toolkit';

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

    const data: any = {
      email,
      A: A.toString(16),
      M1: M1.toString(16),
      sess,
    };

    let kek: Uint8Array | undefined = undefined;

    if (firstLogin) {
      kek = await encryptionService.deriveKek(password, bigintToUint8(salt));

      const {
        encSecret,
        encMaster
      } = await this.generateUserSecrets(S, kek);

      data.encSecret = uint8ToHex(encSecret);
      data.encMaster = uint8ToHex(encMaster);
    }

    const res = await this.authenticatePost(data);

    kekStorage.value = secretToolkit.encode(
      kek = kek || await encryptionService.deriveKek(password, bigintToUint8(salt)),
      Encoder.HEX
    );

    return res.data.data;
  }

  async generateUserSecrets(
    S: bigint,
    kek: Uint8Array
  ) {
    const uintS = bigintToUint8(S);

    const secretKey = secretToolkit.genSecret(16, Encoder.HEX);
    const masterKey = secretToolkit.genSecret(16, Encoder.HEX);

    const encSecret = await sodiumCipher.encrypt(secretKey, kek);
    const encMaster = await sodiumCipher.encrypt(masterKey, secretToolkit.decode(secretKey));

    return {
      encSecret: await sodiumCipher.encrypt(encSecret, uintS),
      encMaster: await sodiumCipher.encrypt(encMaster, uintS),
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
