<template>
  <ion-app>
    <ion-router-outlet />
    <StoreViewer v-if="!prod"></StoreViewer>
  </ion-app>
</template>

<script setup lang="ts">
import StoreViewer from '@/components/StoreViewer.vue';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';

const prod = import.meta.env.PROD;
</script>
