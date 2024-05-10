<script setup lang="ts">
import logoDark from '@/assets/images/logo-h-dark.svg';
import HeaderCondense from '@/components/layout/HeaderCondense.vue';
import { isMobile } from '@/store/main-store';
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

const props = withDefaults(
  defineProps<{
    title?: string;
    headerCondense?: boolean;
    showMenuButton?: boolean;
    color?: string;
    defaultBack?: any;
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
              <ion-menu-button class="c-button c-button--menu" v-if="showMenuButton && !isMobile"></ion-menu-button>
              <ion-back-button v-else :default-href="defaultBack"></ion-back-button>
            </ion-buttons>
          </slot>
        </div>

        <div slot="primary">
          <slot name="primary">
            <ion-buttons>

            </ion-buttons>
          </slot>
        </div>

        <div slot="secondary">
          <slot name="secondary">

          </slot>
        </div>

        <ion-title class="">
          <template v-if="title">
            {{ title }}
          </template>
          <template v-if="!headerCondense && !title">
            <ion-img class="only-dark" :src="logoDark"
              style="height: 48px; display: inline-block;" />
          </template>
        </ion-title>

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

    <template v-if="$slots.footer">
      <slot name="footer" slot="footer"></slot>
    </template>
  </ion-page>
</template>

<style scoped>

</style>
