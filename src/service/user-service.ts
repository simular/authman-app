import router from '@/router';
import apiClient from '@/service/api-client';
import authService from '@/service/auth-service';
import localAuthService from '@/service/local-auth-service';
import {
  accessTokenStorage,
  accountsLoaded,
  accountsStorage,
  encMasterStorage,
  encSecretStorage,
  kekStorage,
  mainStore,
  refreshTokenStorage,
  saltStorage,
  userStorage,
} from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { User } from '@/types';
import { useLoadingOverlay } from '@/utilities/loading';
import secretToolkit, { Encoder } from '@/utilities/secret-toolkit';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { headShake } from '@asika32764/vue-animate';
import { alertController, AlertOptions } from '@ionic/vue';
import { AxiosError } from 'axios';

export default new class UserService {
  async logoutAndRedirect() {
    const { run } = await useLoadingOverlay('Logout...');

    await run(async () => {
      accessTokenStorage.value = '';
      refreshTokenStorage.value = '';

      accountsStorage.value = [];
      accountsLoaded.value = false;

      mainStore.user = undefined;
      mainStore.decryptedAccounts = [];

      // Options
      await this.clearUserOptions();

      // Secrets
      await this.clearUserSecrets();
    });

    router.replace({ name: 'login' });
  }

  async prepareLogin() {
    // Options
    await this.clearUserOptions();

    // Secrets
    await this.clearUserSecrets();
  }

  async storeUserSecrets(
    user: User,
    salt: string | Uint8Array,
    kek: string | Uint8Array,
    encSecret: string,
    encMaster: string
  ) {
    if (typeof salt === 'object') {
      salt = secretToolkit.encode(salt, Encoder.HEX);
    }

    if (typeof kek === 'object') {
      kek = secretToolkit.encode(kek, Encoder.HEX);
    }

    saltStorage.value = salt;
    kekStorage.value = kek;
    encSecretStorage.value = encSecret;
    encMasterStorage.value = encMaster;
    userStorage.value = user;
  }

  async clearUserSecrets() {
    encSecretStorage.value = '';
    encMasterStorage.value = '';
    kekStorage.value = '';
    saltStorage.value = '';
    userStorage.value = undefined;

    await localAuthService.clearKek();
  }

  async clearUserOptions() {
    enableBiometricsOption.value = false;
  }

  async touch() {
    return await apiClient.get('auth/me');
  }

  async askNewPasswordOrLogout() {
    const password = await this.askPassword(
      'Your Password has Changed.',
      'Please enter new password to continue.',
      {
        backdropDismiss: false,
        buttons: [
          {
            text: 'Logout',
            role: 'logout',
            handler: () => {
              this.logoutAndRedirect();
            }
          },
          {
            text: 'OK',
            role: 'confirm',
            async handler({ password }) {
              if (!password) {
                return false;
              }

              const buttons = Array.from(
                document.querySelectorAll<HTMLButtonElement>('.alert-button-group button')
              );
              const input = document.querySelector<HTMLInputElement>('#input-password')!;
              input.style.borderColor = '';

              for (const button of buttons) {
                button.style.opacity = '0.45';
                button.style.pointerEvents = 'none';
              }

              try {
                await authService.login(
                  userStorage.value?.email || '',
                  password
                );

                return password;
              } catch (e) {
                console.error(e);

                if (e instanceof Error || e instanceof AxiosError) {
                  input.style.borderColor = 'var(--ion-color-danger)';
                  input.setCustomValidity('Invalid password.');
                  input.reportValidity();
                  headShake(input);

                  setTimeout(() => {
                    input.setCustomValidity('');
                  }, 1000);
                }
              } finally {
                for (const button of buttons) {
                  button.style.opacity = '1';
                  button.style.pointerEvents = '';
                }
              }

              return false;
            },
          },
        ]
      }
    )
  }

  async askPassword(header = 'Password', message = '', options: AlertOptions = {}) {
    return new Promise<string | false>((resolve) => {
      alertController.create({
        header,
        message,
        inputs: [
          {
            type: 'password',
            name: 'password',
            id: 'input-password'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'OK',
            role: 'confirm',
          },
        ],
        ...options
      })
        .then((alert) => {
          alert.onDidDismiss().then((e) => {
            if (e.role === 'backdrop' || e.role === 'cancel') {
              resolve(false);
            }

            if (e.role === 'confirm') {
              resolve(e.data.values.password);
            }

            return e;
          });

          return alert.present();
        })
        .then((alert) => {
          document.querySelector<HTMLInputElement>('#input-password')?.focus();

          return alert;
        });
    });
  }
};
