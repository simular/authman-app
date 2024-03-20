<script setup lang="ts">

import ModalLayout from '@/components/layout/ModalLayout.vue';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/vue';
import { ref } from 'vue';

const currentSegment = ref<'qrcode'|'entering'>('qrcode');
</script>

<template>
<ModalLayout title="Create an account">
  <template #title>
    <ion-segment v-model="currentSegment">
      <ion-segment-button value="qrcode">
        <ion-label>QRCode</ion-label>
      </ion-segment-button>
      <ion-segment-button value="entering">
        <ion-label>Entering</ion-label>
      </ion-segment-button>
    </ion-segment>
  </template>


</ModalLayout>
</template>

<style scoped>

</style>
