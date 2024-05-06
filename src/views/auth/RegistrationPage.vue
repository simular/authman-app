<script setup lang="ts">

import logo from '@/assets/images/icon.svg';
import { default as vPasswordStrength } from '@/directive/password-strength';
import apiClient from '@/service/api-client';
import authService from '@/service/auth-service';
import { srpClient } from '@/service/srp';
import { User } from '@/types';
import useLoading from '@/utilities/loading';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  IonButton,
  IonContent,
  IonInput, IonItem, IonList,
  IonPage,
  IonSpinner,
  toastController,
  useIonRouter,
} from '@ionic/vue';
import { ref } from 'vue';

const router = useIonRouter();
const email = ref(import.meta.env.VITE_TEST_REGISTER_USERNAME || '');
const password = ref(import.meta.env.VITE_TEST_REGISTER_PASSWORD || '');
const { loading, run } = useLoading();

async function register() {
  const client = srpClient();

  const result = await run(async () => {
    const { salt, verifier } = await client.register(email.value, password.value);

    await apiClient.post<{
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
      },
    );

    return authService.login(email.value, password.value);
  });

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

        <div style="width: 85%; display: grid; gap: 1rem;">
          <ion-list style="display: grid; gap: 1rem;">
            <ion-item>
              <ion-input label="Email"
                type="email"
                fill="solid"
                label-placement="stacked"
                placeholder=""
                autocomplete="email"
                v-model="email"
              >
                <FontAwesomeIcon :icon="faEnvelope" slot="start" />
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input label="Password"
                v-password-strength
                type="password"
                fill="solid"
                label-placement="stacked"
                placeholder=""
                v-model="password"
              >
                <FontAwesomeIcon :icon="faLock" slot="start" />
              </ion-input>
            </ion-item>
          </ion-list>

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

ion-item {
  --padding-start: 0;
}
</style>
