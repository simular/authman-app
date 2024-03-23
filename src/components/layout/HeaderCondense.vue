<script setup lang="ts">
import { IonHeader, IonTitle, IonToolbar } from '@ionic/vue';
</script>

<template>
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">
        <slot></slot>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<style scoped>

</style>
