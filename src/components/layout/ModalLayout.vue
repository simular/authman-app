<script setup lang="ts">
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { ComputedRef, inject, nextTick, ref } from 'vue';

defineProps<{
  title?: string;
}>();

const nav = inject<ComputedRef<HTMLIonNavElement>>('nav');

// Nav
const canGoBack = ref(false);

if (nav) {
  setTimeout(async () => {
    canGoBack.value = await nav?.value.canGoBack();
  }, 100);
}

async function back() {
  if (!nav) {
    return;
  }

  nav?.value.pop();
}

function dismissModal() {
  modalController.dismiss();
}
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div slot="start">
          <ion-buttons v-if="canGoBack">
            <ion-button @click="back">Back</ion-button>
          </ion-buttons>
        </div>

        <slot name="title">
          <ion-title v-if="title" class="">{{ title }}</ion-title>
        </slot>

        <ion-buttons slot="end">
          <ion-button @click="dismissModal" size="large" color="dark">
            <FontAwesomeIcon :icon="faTimes" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <slot></slot>
    </ion-content>

    <ion-footer v-if="$slots.footer">
      <ion-toolbar>
        <slot name="footer"></slot>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<style scoped>

</style>
