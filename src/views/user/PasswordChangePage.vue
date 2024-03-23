<script setup lang="ts">

import MainLayout from '@/components/layout/MainLayout.vue';
import apiClient from '@/service/api-client';
import authService from '@/service/auth-service';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import passwordResetService from '@/service/password-reset-service';
import { userStorage } from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import { base64UrlEncode } from '@/utilities/convert';
import useLoading from '@/utilities/loading';
import { sleep } from '@/utilities/timing';
import { IonButton, IonInput, IonItem, IonList, useIonRouter } from '@ionic/vue';
import { useCurrentElement } from '@vueuse/core';
import { hexToBigint, SRPClient, timingSafeEquals } from '@windwalker-io/srp';
import { bigintToUint8, hexToUint8, uint8ToHex } from 'bigint-toolkit';
import { to_base64 } from 'libsodium-wrappers';
import { ref } from 'vue';

enum PasswordChangeState {
  ENTER_ORIGINAL,
  NEW_PASSWORD
}

const router = useIonRouter();
const state = ref(PasswordChangeState.ENTER_ORIGINAL);
const { loading, run } = useLoading();

const el = useCurrentElement<HTMLElement>();
const newPassword = ref('');
const currentPassword = ref('');
const currentSecret = ref('');
let secrets: {
  salt?: Uint8Array;
  sess?: Uint8Array;
  kek?: Uint8Array;
  secret?: Uint8Array;
  master?: Uint8Array;
  S?: Uint8Array;
} = {};

async function checkCurrentPassword() {
  secrets = {};

  const user = userStorage.value!;

  await run(async () => {
    const { salt, B, sess } = await authService.challenge(user.email);

    await authService.authenticateForPasswordChange(
      user.email,
      currentPassword.value,
      sess,
      hexToBigint(salt),
      hexToBigint(B),
    );

    const oldKek = await encryptionService.deriveKek(currentPassword.value, hexToBigint(salt).toString());

    secrets.secret = await encryptionService.getSecretKey(oldKek);
    secrets.master = await encryptionService.getMasterKeyBySecret(secrets.secret);
  });

  state.value = PasswordChangeState.NEW_PASSWORD;

  focusFirstInput();
}

async function checkSecretCode() {
  secrets = {};

  const secret = uint8ToHex(await encryptionService.getSecretKey());
  const providedSecret = currentSecret.value.replace(/-/, '')
    .toLowerCase();

  if (!timingSafeEquals(secret, providedSecret)) {
    simpleAlert('Secret not match');
    return;
  }

  secrets.secret = hexToUint8(providedSecret);
  secrets.master = await encryptionService.getMasterKeyBySecret(secrets.secret);

  state.value = PasswordChangeState.NEW_PASSWORD;

  focusFirstInput();
}

async function focusFirstInput(wait = 800) {
  await sleep(wait);

  const input = el.value.querySelector('input');

  if (input) {
    input.focus();
  }
}

async function submitNewPassword() {
  const user = userStorage.value!;

  await run(async () => {
    if (!secrets.secret || !secrets.master) {
      throw new Error('Missing secrets');
    }

    const { B, sess, salt, verifier } = await passwordResetService.challenge(user.email, newPassword.value);

    return await passwordResetService.reset(
      user.email,
      newPassword.value,
      sess,
      salt,
      verifier,
      hexToBigint(B),
      secrets.secret,
      secrets.master
    );
  });

  router.replace({ name: 'options' });

  // await authService.authenticate(
  //   user.email,
  //   newPassword.value,
  //   sess,
  //   salt,
  //   hexToBigint(B),
  //   async (data, kek, { S }) => {
  //     const uintS = bigintToUint8(S);
  //
  //     if (!secrets.secret || !secrets.master) {
  //       throw new Error('Missing secrets');
  //     }
  //
  //     const secretKey = secrets.secret!;
  //     const masterKey = secrets.master!;
  //
  //     // Use new KEK to encrypt secret & master and save to server
  //     const encSecret = base64UrlEncode(await sodiumCipher.encrypt(secretKey, kek));
  //     const encMaster = base64UrlEncode(await sodiumCipher.encrypt(masterKey, secretKey));
  //
  //     data.encSecret = base64UrlEncode(await sodiumCipher.encrypt(encSecret, uintS));
  //     data.encMaster = base64UrlEncode(await sodiumCipher.encrypt(encMaster, uintS));
  //   }
  // );
}

</script>

<template>
<MainLayout title="Password Change" header-condense>
  <div class="ion-padding">
    <Transition name="fade" mode="out-in">

      <!-- Check current secrets -->
      <div v-if="state === PasswordChangeState.ENTER_ORIGINAL">
        <div>
          <p>
            Please provide your current password.
          </p>
          <ion-list>
            <ion-item>
              <ion-input
                label="Password"
                label-placement="stacked"
                type="password"
                v-model="currentPassword"
                placeholder="****"
                autocomplete="current-password"
              />
            </ion-item>
          </ion-list>

          <div style="margin-top: 1.5rem">
            <ion-button expand="full" @click="checkCurrentPassword"
              :disabled="loading">
              Submit
            </ion-button>
          </div>
        </div>

        <div style="margin-top: 5rem">
          <p>
            If you forgot your password, please provide personal secret code.
          </p>

          <ion-list>
            <ion-item>
              <ion-input
                label="Secret Code"
                label-placement="stacked"
                type="text"
                v-model="currentSecret"
                placeholder="****"
              />
            </ion-item>
          </ion-list>

          <div style="margin-top: 1.5rem">
            <ion-button expand="full" @click="checkSecretCode"
              :disabled="loading">
              Submit
            </ion-button>
          </div>
        </div>
      </div>

      <!-- New Password -->
      <div v-else>
        <div>
          <ion-list>
            <ion-item>
              <ion-input
                label="New Password"
                label-placement="stacked"
                type="password"
                v-model="newPassword"
                placeholder="****"
                autocomplete="new-password"
              />
            </ion-item>
          </ion-list>

          <div style="margin-top: 1.5rem">
            <ion-button expand="full" @click="submitNewPassword"
              :disabled="loading">
              Change Password
            </ion-button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</MainLayout>
</template>

<style scoped>

</style>
