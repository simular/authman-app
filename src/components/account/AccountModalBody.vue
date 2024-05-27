<script setup lang="ts">

import AccountQRCode from '@/components/account/AccountQRCode.vue';
import AccountToken from '@/components/account/AccountToken.vue';
import ModalLayout from '@/components/layout/ModalLayout.vue';
import { Account } from '@/types';
import { faChevronLeft, faEdit, faEllipsis, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { actionSheetController, IonButton, IonButtons, IonContent, IonToolbar } from '@ionic/vue';
import { ref } from 'vue';

const props = defineProps<{
  account: Account;
}>();

const emits = defineEmits(['delete', 'edit']);
const mode = ref<'token'|'qrcode'>('token');

async function showMenu() {
  const as = await actionSheetController.create({
    header: 'Actions',
    buttons: [
      {
        text: 'Show QRCode',
        handler() {
          mode.value = 'qrcode';
        },
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler() {
          emits('delete');
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ]
  });

  await as.present();
}
</script>

<template>
<ModalLayout :scroll-y="false">
  <template #header>
    <div></div>
  </template>

  <ion-content class="ion-padding" v-if="account"
    :scroll-y="false"
  >
    <transition name="fade" mode="out-in" class="box-center" style="height: 100%">
      <AccountToken v-if="mode === 'token'" :item="account" />
      <AccountQRCode v-else :item="account" />
    </transition>
  </ion-content>

  <template #footer>
    <ion-toolbar style="--ion-safe-area-bottom: 0">
      <template v-if="mode === 'token'">
        <ion-buttons slot="start">
          <ion-button @click="$emit('edit')">
            <FontAwesomeIcon :icon="faEdit" style="margin-right: .5rem" />
            Edit
          </ion-button>
        </ion-buttons>

        <ion-buttons slot="end">
          <ion-button
            @click="showMenu"
          >
            <FontAwesomeIcon :icon="faEllipsis"
              style="margin-left: .25rem; margin-right: .25rem" />
          </ion-button>
        </ion-buttons>
      </template>
      <template v-else>
        <ion-buttons slot="start">
          <ion-button @click="mode = 'token'">
            <FontAwesomeIcon :icon="faChevronLeft" style="margin-right: .5rem" />
            Back
          </ion-button>
        </ion-buttons>
      </template>
    </ion-toolbar>
  </template>
</ModalLayout>
</template>

<style scoped>

</style>
