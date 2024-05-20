<script setup lang="ts">

import MainLayout from '@/components/layout/MainLayout.vue';
import exportService from '@/service/export-service';
import importService from '@/service/import-service';
import userDeleteService from '@/service/user-delete-service';
import { userStorage } from '@/store/main-store';
import { faDownload, faEnvelope, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
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
