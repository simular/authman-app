import apiClient from '@/service/api-client';
import authService from '@/service/auth-service';
import localAuthService from '@/service/local-auth-service';
import userService from '@/service/user-service';
import { userStorage } from '@/store/main-store';
import { simpleActionSheetConfirm, simpleAlert } from '@/utilities/alert';
import { useLoadingOverlay } from '@/utilities/loading';
import { hexToBigint } from '@windwalker-io/srp';
import { bigintToHex } from 'bigint-toolkit';

export default new class {
  async deleteMeAndLogout() {
    await this.deleteMe();

    await userService.logoutAndRedirect();
  }

  async deleteMe() {
    const v = await simpleActionSheetConfirm(
      'This action cannot redo.',
      [
        'Delete It',
        'Cancel',
      ],
      {
        subHeader: 'Do you really want to delete account?'
      }
    );

    if (!v) {
      return;
    }

    const password = await userService.askPassword(
      'Your Password',
      'Please enter master password again'
    );

    if (!password) {
      return;
    }

    const kek = await localAuthService.validatePasswordAndGetKek(password);

    if (!kek) {
      simpleAlert('Invalid password.');
      return;
    }

    const { loading, run } = await useLoadingOverlay('Deleting account...');

    await run(async () => {
      const user = userStorage.value!;
      const { salt, B, sess } = await authService.challenge(user.email);

      const { A, M1, S } = await authService.runSRPLoginSteps(
        user.email,
        password,
        hexToBigint(salt),
        hexToBigint(B),
      );

      return this.deleteAccount(A, M1, sess);
    });
  }

  async deleteAccount(A: bigint, M1: bigint, sess: string) {
    const user = userStorage.value!;

    return apiClient.post(
      'auth/delete/me',
      {
        email: user.email,
        A: bigintToHex(A),
        M1: bigintToHex(M1),
        sess,
      }
    );
  }
}
