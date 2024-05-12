<template>
  <ion-app>
    <ion-router-outlet />
    <StoreViewer v-if="!isNative"></StoreViewer>
  </ion-app>
</template>

<script setup lang="ts">
import StoreViewer from '@/components/StoreViewer.vue';
import { isNative } from '@/store/main-store';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';

</script>
