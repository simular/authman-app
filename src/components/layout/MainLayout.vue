<script setup lang="ts">
import logoDark from '@/assets/images/logo-h-dark.svg';
import logoLight from '@/assets/images/logo-h-light.svg';
import HeaderCondense from '@/components/layout/HeaderCondense.vue';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';

withDefaults(
  defineProps<{
    title?: string;
    headerCondense?: boolean;
    showMenuButton?: boolean;
    color?: string;
  }>(),
  {
    headerCondense: false,
    showMenuButton: false,
  },
);

</script>

<template>
  <ion-page>
    <ion-header class="">
      <ion-toolbar>
        <div slot="start">
          <slot name="start">
            <ion-buttons>
              <ion-menu-button class="c-button c-button--menu" v-if="showMenuButton"></ion-menu-button>
              <ion-back-button v-else></ion-back-button>
              <ion-img v-if="!headerCondense && !title" class="only-dark" :src="logoDark"
                style="height: 48px" />
            </ion-buttons>
          </slot>
        </div>

        <ion-title v-if="title" class="text-center">{{ title }}</ion-title>

        <div slot="end">
          <slot name="end">

          </slot>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :color fullscreen>
      <HeaderCondense v-if="title && headerCondense" :color>
        {{ title }}
      </HeaderCondense>

      <template v-if="$slots.fixed">
        <slot name="fixed"></slot>
      </template>

      <slot></slot>
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>
