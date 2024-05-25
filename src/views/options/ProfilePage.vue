<script setup lang="ts">

import MainLayout from '@/components/layout/MainLayout.vue';
import apiClient from '@/service/api-client';
import exportService from '@/service/export-service';
import importService from '@/service/import-service';
import userDeleteService from '@/service/user-delete-service';
import userService from '@/service/user-service';
import { userStorage } from '@/store/main-store';
import { simpleConfirm } from '@/utilities/alert';
import { useLoadingOverlay } from '@/utilities/loading';
import {
  faDownload,
  faEnvelope,
  faSignOut,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/vue';

const user = userStorage.value!;

async function importAccounts() {
  await importService.import();
}

async function exportAccounts() {
  await exportService.export();
}

async function deleteAccount() {
  await userDeleteService.deleteMeAndLogout();
}

async function sessionsRefresh() {
  const v = await simpleConfirm(
    'This will sign your all devices out.',
    'You must re-login this device.'
  );

  if (!v) {
    return;
  }

  const { run } = await useLoadingOverlay('Refreshing and Logout...');

  const res = await run(() => apiClient.post('user/sessions/refresh'));

  await userService.logoutAndRedirect();
}
</script>

<template>
  <MainLayout color="light"
    default-back="options">
    <ion-list-header>
      My Account
    </ion-list-header>
    <ion-list style="" inset>
      <!-- Email -->
      <ion-item>
        <FontAwesomeIcon :icon="faEnvelope" slot="start" />
        <ion-label>
          <h4>My Email</h4>
          <ion-note>{{ user.email }}</ion-note>
        </ion-label>
      </ion-item>

      <!-- sessions Refresh -->
      <ion-item button @click="sessionsRefresh">
        <FontAwesomeIcon :icon="faSignOut" slot="start" />
        <ion-label>
          <h4>Sign-Out from All My Devices</h4>
          <ion-note>
            Make all session tokens expired, you must re-login again.
          </ion-note>
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

    <ion-list-header>
      Dangerous Zone
    </ion-list-header>

    <ion-list style="" inset>
      <!-- Logout -->
      <ion-item button @click="deleteAccount" style="--color: var(--ion-color-danger)">
        <FontAwesomeIcon :icon="faTrash" slot="start">
        </FontAwesomeIcon>
        <ion-label>
          Delete My Account
        </ion-label>
      </ion-item>
    </ion-list>
  </MainLayout>
</template>

<style scoped>

</style>
