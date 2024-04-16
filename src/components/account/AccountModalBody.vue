<script setup lang="ts">

import AccountToken from '@/components/account/AccountToken.vue';
import ModalLayout from '@/components/layout/ModalLayout.vue';
import { Account } from '@/types';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonButton, IonButtons, IonContent, IonToolbar } from '@ionic/vue';

const props = defineProps<{
  account: Account;
}>();
</script>

<template>
<ModalLayout :scroll-y="false">
  <template #header>
    <div></div>
  </template>

  <ion-content class="ion-padding" v-if="account"
    :scroll-y="false">
    <div class="box-center" style="height: 100%">
      <AccountToken :item="account" />
    </div>
  </ion-content>

  <template #footer>
    <ion-toolbar style="--ion-safe-area-bottom: 0">
      <ion-buttons slot="start">
        <ion-button @click="$emit('edit')">
          <FontAwesomeIcon :icon="faEdit" style="margin-right: .5rem" />
          Edit
        </ion-button>
      </ion-buttons>

      <ion-buttons slot="end">
        <ion-button color="danger"
          @click="$emit('delete')">
          <FontAwesomeIcon :icon="faTrash" style="margin-right: .5rem" />
          Delete
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </template>
</ModalLayout>
</template>

<style scoped>

</style>
