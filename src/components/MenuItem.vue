<script setup lang="ts">

import { IonIcon, IonItem, IonLabel } from '@ionic/vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  href: string;
  icon?: any;
}>();

const route = useRoute();

function activeColor(): string | undefined {
  if (isActive()) {
    return 'primary';
  }

  return undefined;
}

function isActive() {
  return route.path.startsWith(props.href);
}

</script>

<template>
  <ion-item :button="true" :router-link="href" :href @click.prevent :color="activeColor()">
    <div slot="start">
      <slot name="start">
        <ion-icon aria-hidden="true" :icon></ion-icon>
      </slot>
    </div>
    <ion-label>
      <slot></slot>
    </ion-label>
    <div slot="end">
      <slot name="end"></slot>
    </div>
  </ion-item>
</template>

<style scoped>

</style>
