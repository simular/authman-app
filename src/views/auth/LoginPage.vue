<script setup lang="ts">
import apiClient from '@/service/api-client';
import { accessTokenStorage, refreshTokenStorage, userStorage } from '@/store/main-store';
import { User } from '@/types';
import useLoading from '@/utilities/loading';
import { IonPage, IonContent, IonButton, IonInput, IonSpinner, useIonRouter } from '@ionic/vue';
import logo from '@/assets/images/logo-sq-w.svg';
import { ref } from 'vue';

const router = useIonRouter();

const email = ref(import.meta.env.VITE_TEST_USERNAME || '');
const password = ref(import.meta.env.VITE_TEST_PASSWORD || '');
const { loading, run } = useLoading();

async function authenticate() {
  const auth = btoa(`${email.value}:${password.value}`);

  const res = await run(() => apiClient.get<{
    data: {
      user: User;
      accessToken: string;
      refreshToken: string;
    }
  }>(
    'auth/authenticate',
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  ));

  const { user, accessToken, refreshToken } = res.data.data;

  userStorage.value = user;
  accessTokenStorage.value = accessToken;
  refreshTokenStorage.value = refreshToken;

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

        <h3 style="margin-bottom: 1.5rem">Sign In</h3>

        <div style="width: 100%; display: grid; gap: 1rem;">
          <ion-input label="Email"
            type="email"
            fill="solid"
            label-placement="stacked"
            placeholder="xxx@xxx.xx"
            autocomplete="email"
            v-model="email"
          >
          </ion-input>

          <ion-input label="Password"
            type="password"
            fill="outline"
            label-placement="stacked"
            placeholder="**********"
            v-model="password"
          >
          </ion-input>

          <ion-button expand="block" @click="authenticate"
            :disabled="loading">
            <template v-if="!loading">
              Login
            </template>
            <template v-else>
              <ion-spinner name="dots" />
            </template>
          </ion-button>

          <ion-button expand="block" fill="clear"
            :disabled="loading">
            Not have account?
          </ion-button>
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
