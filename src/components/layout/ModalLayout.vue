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

withDefaults(
  defineProps<{
    title?: string;
    scrollY?: boolean;
  }>(),
  {
    scrollY: true
  }
);

const nav = inject<ComputedRef<HTMLIonNavElement> | undefined>('nav', undefined);

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
    <slot name="header">
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
    </slot>

    <ion-content :scroll-y="scrollY">
      <slot></slot>
    </ion-content>

    <ion-footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </ion-footer>
  </ion-page>
</template>

<style scoped>

</style>
