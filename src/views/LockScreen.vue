<script setup lang="ts">

import logo from '@/assets/images/logo-sq-w.svg';
import lockScreenService from '@/service/lock-screen-service';
import { isLock, kekStorage, noInstantUnlock, userStorage } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { simpleToast } from '@/utilities/alert';
import useLoading from '@/utilities/loading';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { headShake } from '@asika32764/vue-animate';
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonSpinner,
  onIonViewWillEnter,
  useBackButton,
  useIonRouter,
} from '@ionic/vue';
import { type ComponentPublicInstance, onMounted, ref } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

const router = useIonRouter();
const route = useRoute();
const user = userStorage.value;
const unlockMode = ref<'biometrics' | 'password'>('password');

if (!user) {
  router.replace({ name: 'login' });
}

useBackButton(500, (e) => {
  console.log('Android back button', e);
});

onBeforeRouteLeave(() => {
  return !isLock.value;
});

onIonViewWillEnter(async () => {
  password.value = import.meta.env.VITE_TEST_PASSWORD || '';

  unlockMode.value = enableBiometricsOption.value ? 'biometrics' : 'password';

  if (!noInstantUnlock.value && unlockMode.value === 'biometrics') {
    await biometricsUnlock();
  }
});

onMounted(async () => {
  document.addEventListener('ionBackButton', (e) => {
    console.log('ionBackButton', e);
  });
});

const email = ref(user?.email);
const password = ref('');
const passwordInput = ref<ComponentPublicInstance<typeof IonInput>>();
const { loading, run } = useLoading();

async function biometricsUnlock() {
  try {
    await run(async () => {
      await lockScreenService.biometricsAuthenticate();

      const kek = (await SecureStorage.get('@authman:secure.kek')) as string;

      if (!kek) {
        throw new Error('You must re-enter your password.');
      }

      kekStorage.value = kek;

      await lockScreenService.unlock();
    }, false);

    router.navigate({ name: 'accounts' }, 'back', 'pop');
  } catch (e) {
    if (e instanceof Error) {
      simpleToast(e.message);
    }

    unlockMode.value = 'password';

    passwordInput.value!.$el.setFocus(true);
  }
}

async function passwordUnlock() {
  passwordInput.value!.$el.classList.remove('ion-invalid', 'ion-touched');

  try {
    await run(async () => {
      kekStorage.value = await lockScreenService.passwordAuthenticate(password.value);

      await lockScreenService.unlock();
    }, false);

    router.navigate({ name: 'accounts' }, 'back', 'pop');
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
          <template v-if="unlockMode === 'password'">
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
          </template>
          <template v-else>
            <ion-button expand="block" @click="biometricsUnlock"
              fill="clear"
              :disabled="loading">
              <template v-if="!loading">
                Unlock
              </template>
              <template v-else>
                <ion-spinner name="dots" />
              </template>
            </ion-button>
          </template>
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
