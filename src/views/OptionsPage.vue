<script setup lang="ts">
import icon from '@/assets/images/icon.svg';
import MainLayout from '@/components/layout/MainLayout.vue';
import exportService from '@/service/export-service';
import importService from '@/service/import-service';
import localAuthService from '@/service/local-auth-service';
import lockScreenService from '@/service/lock-screen-service';
import userService from '@/service/user-service';
import { isElectron, noInstantUnlock, userStorage } from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { simpleConfirm } from '@/utilities/alert';
import { Share } from '@capacitor/share';
import {
  faDownload,
  faEnvelope, faFileExport, faFileImport,
  faFingerprint,
  faKey,
  faLock,
  faShareNodes,
  faSignOut, faUpload, faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonImg, IonItem, IonLabel, IonList, IonNote, IonToggle, useIonRouter } from '@ionic/vue';
import { watch } from 'vue';

const router = useIonRouter();
const user = userStorage.value!;

watch(enableBiometricsOption, async (v) => {
  if (v) {
    const r = await lockScreenService.testBiometricsAndStoreKek();

    if (!r) {
      enableBiometricsOption.value = false;
    }
  } else {
    await localAuthService.clearKek();
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

async function importAccounts() {
  await importService.import();
}

async function exportAccounts() {
  await exportService.export();
}

async function share() {
  await Share.share({
    title: 'Authman App',
    url: import.meta.env.VITE_INFO_WEBSITE
  });
}

async function logout() {
  const v = await simpleConfirm('Do you want to logout?');

  if (v) {
    userService.logoutAndRedirect();
  }
}
</script>

<template>
  <MainLayout show-menu-button color="light">
    <div class="l-content">
      <ion-list style="" inset>
        <!-- About -->
        <ion-item button router-link="about">
          <ion-img :src="icon" slot="start" style="height: 1.5rem; width: 1.5rem;" />
          <ion-label>
            About Authman
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list style="" inset>
        <!-- Biometrics -->
        <ion-item>
          <FontAwesomeIcon :icon="faFingerprint" slot="start" />
          <ion-toggle v-model="enableBiometricsOption">
            <ion-label>Enable Biometrics</ion-label>
            <ion-note color="medium">Touch ID or Face ID</ion-note>
          </ion-toggle>
        </ion-item>

        <!-- Lock Screen -->
        <ion-item button @click="lockScreen">
          <FontAwesomeIcon :icon="faLock" slot="start" />
          <ion-label>
            Lock Screen
          </ion-label>
        </ion-item>

        <!-- Change Password -->
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

      <ion-list style="" inset>
        <!-- Email -->
        <ion-item>
          <FontAwesomeIcon :icon="faUserAlt" slot="start" />
          <ion-label>
            <h4>My Email</h4>
            <ion-note>{{ user.email }}</ion-note>
          </ion-label>
        </ion-item>

        <!-- Import -->
        <ion-item button @click="importAccounts">
          <FontAwesomeIcon :icon="faUpload" slot="start" />
          <ion-label>
            Import
          </ion-label>
        </ion-item>

        <!-- Export -->
        <ion-item button @click="exportAccounts">
          <FontAwesomeIcon :icon="faDownload" slot="start" />
          <ion-label>
            Export
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list inset>
        <!-- Share -->
        <ion-item button @click="share">
          <FontAwesomeIcon :icon="faShareNodes" slot="start">
          </FontAwesomeIcon>
          <ion-label>
            Share
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list inset>
        <!-- Logout -->
        <ion-item button @click="logout" style="--color: var(--ion-color-danger)">
          <FontAwesomeIcon :icon="faSignOut" slot="start">
          </FontAwesomeIcon>
          <ion-label>
            Logout
          </ion-label>
        </ion-item>
      </ion-list>
    </div>
  </MainLayout>
</template>

<style scoped lang="scss">
.l-content {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
</style>
