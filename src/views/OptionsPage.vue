<template>
  <MainLayout title="Options" show-menu-button header-condense color="light">
    <ion-list style="margin-bottom: 2rem" inset>
      <ion-item>
        <FontAwesomeIcon :icon="faFingerprint" slot="start" />
        <ion-toggle v-model="enableBiometricsOption">
          <ion-label>Enable Biometrics</ion-label>
          <ion-note color="medium">Touch ID or Face ID</ion-note>
        </ion-toggle>
      </ion-item>

      <ion-item button @click="lockScreen">
        <FontAwesomeIcon :icon="faLock" slot="start" />
        <ion-label>
          Lock Screen
        </ion-label>
      </ion-item>

      <ion-item button
        href="password/change"
        router-link="password/change"
        @click.prevent=""
      >
        <FontAwesomeIcon :icon="faKey" slot="start">
        </FontAwesomeIcon>
        <ion-label>
          Change Password
        </ion-label>
      </ion-item>
    </ion-list>

    <ion-list inset>
      <ion-item button @click="logout" style="--color: var(--ion-color-danger)">
        <FontAwesomeIcon :icon="faSignOut" slot="start">
        </FontAwesomeIcon>
        <ion-label>
          Logout
        </ion-label>
      </ion-item>
    </ion-list>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import lockScreenService from '@/service/lock-screen-service';
import userService from '@/service/user-service';
import { noInstantUnlock } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { simpleConfirm } from '@/utilities/alert';
import { faFingerprint, faKey, faLock, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonItem, IonLabel, IonList, IonNote, IonToggle, useIonRouter } from '@ionic/vue';
import { watch } from 'vue';

const router = useIonRouter();

watch(enableBiometricsOption, async (v) => {
  if (v) {
    const r = await lockScreenService.testBiometrics();

    if (!r) {
      enableBiometricsOption.value = false;
    }
  }
});

function lockScreen() {
  noInstantUnlock.value = true;

  lockScreenService.handleBeforeLock();

  router.navigate(
    { name: 'lock' },
    'forward',
    'push'
  );
}


async function logout() {
  const v = await simpleConfirm('Do you want to logout?');

  if (v) {
    userService.logoutAndRedirect();
  }
}
</script>
