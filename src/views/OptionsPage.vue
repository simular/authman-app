<template>
  <MainLayout title="Options">
    <ion-header collapse="condense">
      <ion-toolbar>
        <ion-title size="large">Options</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-list>
      <ion-item button @click="logout">
        <ion-icon :icon="logOut" slot="start">
        </ion-icon>
        <ion-label>
          Logout
        </ion-label>
      </ion-item>
    </ion-list>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import userService from '@/service/user-service';
import { IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonIcon } from '@ionic/vue';
import { logOut } from 'ionicons/icons';

function logout() {
  userService.logoutAndRedirect();
}
</script>
