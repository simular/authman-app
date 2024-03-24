<script setup lang="ts">
import { IonHeader, IonTitle, IonToolbar } from '@ionic/vue';

defineProps<{
  color?: string;
}>();
</script>

<template>
  <ion-header collapse="condense">
    <ion-toolbar :color>
      <ion-title size="large">
        <slot></slot>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<style scoped>

</style>
