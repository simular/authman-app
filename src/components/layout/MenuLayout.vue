<script setup lang="ts">
import { IonMenu, IonContent, IonTitle, IonToolbar, IonHeader, IonMenuToggle } from '@ionic/vue';
</script>

<template>
  <ion-menu content-id="main-content">
    <ion-header class="py-0 px-3">
      <ion-toolbar>
        <ion-title class="text-center">
          Menu
        </ion-title>

        <slot name="end" slot="end" class="m-0">
        </slot>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-menu-toggle :auto-hide="false">
        <slot></slot>
      </ion-menu-toggle>
    </ion-content>
  </ion-menu>
</template>

<style scoped>

</style>
