<script setup lang="ts">
import logo from '@/assets/images/logo-dark.svg';
import vValidation from '@/directive/v-validation';
import authService from '@/service/auth-service';
import { accessTokenStorage, isLogin, refreshTokenStorage, userStorage } from '@/store/main-store';
import useLoading from '@/utilities/loading';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  IonButton,
  IonContent,
  IonInput, IonItem, IonList,
  IonPage,
  IonSpinner,
  useBackButton,
  useIonRouter,
} from '@ionic/vue';
import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const router = useIonRouter();
const email = ref(import.meta.env.VITE_TEST_USERNAME || '');
const password = ref(import.meta.env.VITE_TEST_PASSWORD || '');
const { loading, run } = useLoading();

useBackButton(500, (e) => {
  console.log('Android back button', e);
});

onBeforeRouteLeave((to) => {
  if (isLogin.value) {
    return true;
  }

  return to.fullPath.startsWith('/auth');
});

const form = ref<HTMLFormElement>();

async function authenticate() {
  if (!form.value?.checkValidity()) {
    return;
  }

  const result = await run(async () => {
    return authService.login(email.value, password.value);
  });

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

        <form ref="form" style="width: 85%; display: grid; gap: 1rem;">
          <ion-list style="display: grid; gap: 1rem">
            <ion-item>
              <ion-input label="Email"
                type="email"
                fill="solid"
                label-placement="floating"
                placeholder="xxx@xxx.xx"
                autocomplete="email"
                v-model="email"
                required
                v-validation
              >
                <FontAwesomeIcon :icon="faEnvelope" slot="start" />
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input label="Password"
                type="password"
                fill="solid"
                label-placement="floating"
                placeholder="**********"
                autocomplete="current-password"
                v-model="password"
                @keyup.enter="authenticate"
                required
                v-validation
              >
                <FontAwesomeIcon :icon="faLock" slot="start" />
              </ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" @click="authenticate"
            :disabled="loading || !email || !password">
            <template v-if="!loading">
              Login
            </template>
            <template v-else>
              <ion-spinner name="dots" />
            </template>
          </ion-button>

          <ion-button expand="block" fill="clear"
            :disabled="loading"
            router-link="/auth/registration"
          >
            Create an account
          </ion-button>
        </form>
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
