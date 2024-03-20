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
import { inject, nextTick, ref } from 'vue';

defineProps<{
  title?: string;
}>();

const nav: any = inject('nav');

// Nav
const canGoBack = ref(false);

if (nav) {
  nextTick(async () => {
    canGoBack.value = await nav.value.$el.canGoBack();
  });
}

async function back() {
  if (!nav) {
    return;
  }

  nav.value.$el.pop();
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
            <ion-button @click="back">返回</ion-button>
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
