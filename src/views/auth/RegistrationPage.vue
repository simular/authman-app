<script setup lang="ts">

import logo from '@/assets/images/logo-sq-w.svg';
import apiClient from '@/service/api-client';
import authService from '@/service/auth-service';
import { deriveEncKey, sodiumCipher } from '@/service/cipher';
import { accessTokenStorage, refreshTokenStorage, userStorage } from '@/store/main-store';
import { User } from '@/types';
import { text2uint8 } from '@/utilities/convert';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonSpinner,
  useIonRouter,
  toastController,
} from '@ionic/vue';
import useLoading from '@/utilities/loading';
import { hexToBigint, SRPClient, SRPServer } from '@windwalker-io/srp';
import { bigintToUint8, uint8ToHex } from 'bigint-toolkit';
import sodium from 'libsodium-wrappers';
import { ref } from 'vue';

const router = useIonRouter();
const email = ref('');
const password = ref('');
const { loading, run } = useLoading();

async function register() {
  const client = SRPClient.create();

  const res = await run(async () => {
    const { salt, verifier } = await client.register(email.value, password.value);

    const secretKey = sodium.randombytes_buf(16);
    const masterKey = sodium.randombytes_buf(32);
    const secretHex = uint8ToHex(secretKey);
    const kek = await deriveEncKey(text2uint8(password.value));

    const encSecret = await sodiumCipher.encrypt(secretKey, kek);
    const encMaster = await sodiumCipher.encrypt(masterKey, secretKey);

    const regRes = await apiClient.post<{
      data: {
        user: User;
        accessToken: string;
        refreshToken: string;
      }
    }>(
      'auth/register',
      {
        email: email.value,
        salt: salt.toString(16),
        verifier: verifier.toString(16),
        encSecret: uint8ToHex(encSecret)
      }
    );

    return login(encSecret, encMaster);
  });

  const data = res.data.data;

  const { user, accessToken, refreshToken } = data;

  userStorage.value = user;
  accessTokenStorage.value = accessToken;
  refreshTokenStorage.value = refreshToken;

  const toast = await toastController.create({
    message: 'Your account created.',
    position: 'top',
    duration: 3000,
  });
  toast.present();

  router.replace({
    name: 'accounts',
  });
}

async function login(encSecret: Uint8Array, encMaster: Uint8Array) {
  const { salt, B, sess } = await authService.challenge(email.value);

  const { A, M1, S } = await authService.runSRPLoginSteps(
    email.value,
    password.value,
    hexToBigint(salt),
    hexToBigint(B)
  );
  const uintS = bigintToUint8(S);

  encSecret = await sodiumCipher.encrypt(encSecret, uintS);
  encMaster = await sodiumCipher.encrypt(encMaster, uintS);
  console.log(encSecret, encMaster);
  return authService.authenticatePost({
    email: email.value,
    A: A.toString(16),
    M1: M1.toString(16),
    sess,
    encSecret: uint8ToHex(encSecret),
    encMaster: uint8ToHex(encMaster),
  });
}

</script>

<template>
  <ion-page>
    <ion-content fullscreen class="ion-padding">
      <div class="main-content">
        <div style="text-align: center; margin-bottom: 1rem">
          <img :src="logo" alt="logo" style="width: 175px; aspect-ratio: 1">
        </div>

        <h3 style="margin-bottom: 1.5rem">
          Create a new account
        </h3>

        <div style="width: 100%; display: grid; gap: 1rem;">
          <ion-input label="Email"
            type="email"
            fill="solid"
            label-placement="stacked"
            placeholder=""
            autocomplete="email"
            v-model="email"
          >
          </ion-input>

          <ion-input label="Password"
            type="password"
            fill="solid"
            label-placement="stacked"
            placeholder=""
            v-model="password"
          >
          </ion-input>

          <ion-button expand="block" @click="register"
            :disabled="loading">
            <template v-if="!loading">
              Sign Up
            </template>
            <template v-else>
              <ion-spinner name="dots" />
            </template>
          </ion-button>

          <div class="ion-text-center">
            Have an account?
            <router-link to="login">
              Sign in Now
            </router-link>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-content {
  --keyboard-offset: 0 !important;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}
</style>
