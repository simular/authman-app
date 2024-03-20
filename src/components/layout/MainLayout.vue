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
    <ion-header class="">
      <ion-toolbar>
        <div slot="start">
          <slot name="start">
            <ion-buttons>
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
          </slot>
        </div>

        <ion-title class="text-center">{{ title }}</ion-title>

        <div slot="end">
          <slot name="end">

          </slot>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <slot></slot>
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>
