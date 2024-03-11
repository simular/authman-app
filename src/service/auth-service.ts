import apiClient from '@/service/api-client';
import encryptionService from '@/service/encryption-service';
import { User } from '@/types';
import { SRPClient } from '@windwalker-io/srp';
import { uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';

export default new class AuthService {
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
      requirePK: boolean;
    };
  }

  async authenticate(
    email: string,
    password: string,
    sess:string,
    salt: bigint,
    B: bigint,
  ) {
    const { A, M1 } = await this.runSRPLoginSteps(email, password, salt, B);

    return this.authenticatePost({
      email,
      A: A.toString(16),
      M1: M1.toString(16),
      sess
    });
  }

  async runSRPLoginSteps(email: string, password: string, salt: bigint, B: bigint) {
    const srpClient = SRPClient.create();

    const { secret: a, public: A, hash: x } = await srpClient.step1(
      email,
      password,
      salt
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
      }
    }>(
      'auth/authenticate',
      data,
      {
        _noAuth: true,
      },
    );
  }
}
