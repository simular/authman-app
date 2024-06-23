<script setup lang="ts">

import logo from '@/assets/images/logo-dark.svg';
import { default as vDisableSwipeBack } from '@/directive/v-disable-swipe-back';
import { SecretError } from '@/error/errors';
import authService from '@/service/auth-service';
import localAuthService from '@/service/local-auth-service';
import lockScreenService from '@/service/lock-screen-service';
import userService from '@/service/user-service';
import { isLock, kekStorage, noInstantUnlock, userStorage } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { simpleConfirm, simpleToast } from '@/utilities/alert';
import useLoading from '@/utilities/loading';
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
  } else {
    focusPasswordInput();
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
      await localAuthService.biometricsAuthenticate();

      const kek = await localAuthService.getKek();

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

    focusPasswordInput();
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
    const user = userStorage.value

    // If something missed, re-login again to get keys back
    if (e instanceof SecretError && user?.email) {
      try {
        await run(async () => {
          await authService.login(user.email!, password.value);

          await lockScreenService.unlock();
        }, false);

        router.navigate({ name: 'accounts' }, 'back', 'pop');
        return;
      } catch (e) {
        // Nothing, let's outside handle error.
      }
    }

    passwordInput.value!.$el.classList.add('ion-invalid', 'ion-touched');

    headShake(passwordInput.value!.$el);
  }
}

async function logout() {
  const v = await simpleConfirm('Do you want to logout?');

  if (v) {
    isLock.value = false;
    noInstantUnlock.value = false;

    await userService.logoutAndRedirect();
  }
}

function focusPasswordInput(delay = 100) {
  setTimeout(() => {
    passwordInput.value!.$el.setFocus(true);
  }, delay);
}

</script>

<template>
  <ion-page v-disable-swipe-back>
    <ion-content fullscreen class="ion-padding">
      <div class="main-content">
        <div style="text-align: center; margin-bottom: 1rem">
          <img :src="logo" alt="logo" style="width: 175px; aspect-ratio: 1">
        </div>

        <h3 style="margin-bottom: .5rem">Unlock</h3>

        <p>
          {{ email }}
        </p>

        <div style="width: 85%; display: grid; gap: 1rem;">
          <template v-if="unlockMode === 'password'">
            <ion-input
              ref="passwordInput"
              type="password"
              fill="solid"
              label="Password"
              label-placement="floating"
              placeholder="Password"
              v-model="password"
              @keyup.enter="passwordUnlock"
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
            <div style="margin-top: 1.5rem">
              <ion-button expand="block" @click="biometricsUnlock"
                :disabled="loading">
                <template v-if="!loading">
                  Unlock
                </template>
                <template v-else>
                  <ion-spinner name="dots" />
                </template>
              </ion-button>
            </div>
          </template>

          <div style="margin-top: 100px">
            <ion-button expand="block" @click="logout"
              fill="clear"
              color="danger"
              :disabled="loading">
              Logout
            </ion-button>
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
