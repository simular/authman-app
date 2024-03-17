<template>
  <ion-app>
    <ion-router-outlet />
    <Store></Store>
  </ion-app>
</template>

<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue';
import Store from '@/components/Store.vue';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';

</script>
