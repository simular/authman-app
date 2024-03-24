<script setup lang="ts">

import logo from '@/assets/images/logo-sq-w.svg';
import lockScreenService from '@/service/lock-screen-service';
import { isManuallyLock, userStorage } from '@/store/main-store';
import { simpleToast } from '@/utilities/alert';
import useLoading from '@/utilities/loading';
import { headShake } from '@asika32764/vue-animate';
import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonSpinner,
  useBackButton,
  useIonRouter,
} from '@ionic/vue';
import { type ComponentPublicInstance, onMounted, ref } from 'vue';

const router = useIonRouter();
const user = userStorage.value;

if (!user) {
  router.replace({ name: 'login' });
}

useBackButton(500, (e) => {
  console.log('Android back button', e);
});

onMounted(async () => {
  password.value = import.meta.env.VITE_TEST_PASSWORD || '';

  document.addEventListener('ionBackButton', (e) => {
    console.log('ionBackButton', e);
  });

  if (!isManuallyLock.value) {
    await biometricsUnlock();
  }
});

const email = ref(user?.email);
const password = ref('');
const passwordInput = ref<ComponentPublicInstance<typeof IonInput>>();
const { loading, run } = useLoading();

async function biometricsUnlock() {
  try {
    await run(async () => {
      await lockScreenService.biometricsAuthenticate();
      await lockScreenService.unlock();
    }, false);

    router.push({ name: 'accounts' });
  } catch (e) {
    if (e instanceof Error) {
      simpleToast(e.message);
    }

    passwordInput.value!.$el.setFocus(true);
  }
}

async function passwordUnlock() {
  passwordInput.value!.$el.classList.remove('ion-invalid', 'ion-touched');

  try {
    await run(async () => {
        await lockScreenService.passwordAuthenticate(password.value);
        await lockScreenService.unlock();
    }, false);

    router.push({ name: 'accounts' });
  } catch (e) {
    passwordInput.value!.$el.classList.add('ion-invalid', 'ion-touched');

    headShake(passwordInput.value!.$el);
  }
}

</script>

<template>
  <ion-page>
    <ion-content fullscreen class="ion-padding">
      <div class="main-content">
        <div style="text-align: center; margin-bottom: 1rem">
          <img :src="logo" alt="logo" style="width: 175px; aspect-ratio: 1">
        </div>

        <h3 style="margin-bottom: .5rem">Enter Password to Unlock</h3>

        <p>
          {{ email }}
        </p>

        <div style="width: 100%; display: grid; gap: 1rem;">
          <ion-input
            ref="passwordInput"
            type="password"
            fill="solid"
            label-placement="floating"
            placeholder="Password"
            v-model="password"
            error-text="Invalid Password"
            style="width: 85%; margin-left: auto; margin-right: auto"
          >
          </ion-input>

          <ion-button expand="block" @click="passwordUnlock"
            fill="clear"
            :disabled="loading || password === ''">
            <template v-if="!loading">
              Unlock
            </template>
            <template v-else>
              <ion-spinner name="dots" />
            </template>
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
