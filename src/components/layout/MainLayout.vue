<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';

defineProps<{
  title?: string;
}>();
</script>

<template>
  <ion-page>
    <ion-header class="py-0 px-3">
      <ion-toolbar>
        <ion-buttons slot="start" class="m-0">
          <ion-back-button></ion-back-button>
        </ion-buttons>

        <ion-title class="text-center">{{ title }}</ion-title>

        <slot name="end" slot="end" class="m-0">
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </slot>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <slot></slot>
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>
