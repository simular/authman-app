<template>
  <MainLayout title="Options" show-menu-button header-condense>
    <ion-list style="margin-bottom: 2rem">
      <ion-item button @click="changePassword"
        href="password/change"
        router-link="password/change"
        @click.prevent=""
      >
        <FontAwesomeIcon :icon="faLock" slot="start">
        </FontAwesomeIcon>
        <ion-label>
          Change Password
        </ion-label>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-item button @click="logout">
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
import userService from '@/service/user-service';
import { simpleConfirm } from '@/utilities/alert';
import { faLock, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonItem, IonLabel, IonList } from '@ionic/vue';

function changePassword() {

}

async function logout() {
  const v = await simpleConfirm('Do you want to logout?');

  if (v) {
    userService.logoutAndRedirect();
  }
}
</script>
