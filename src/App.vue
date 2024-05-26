<template>
  <ion-app>
    <ion-router-outlet />
    <StoreViewer v-if="!isNative"></StoreViewer>
  </ion-app>
</template>

<script setup lang="ts">
import StoreViewer from '@/components/StoreViewer.vue';
import events, { LockScreenEvent, RootNavigationEvent } from '@/service/events';
import { isNative } from '@/store/main-store';
import { type AnimationBuilder, IonApp, IonRouterOutlet, useIonRouter } from '@ionic/vue';
import { RouteAction, RouteDirection } from '@ionic/vue/dist/types/hooks/router';
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  events.on(LockScreenEvent, lockScreen);
  events.on(RootNavigationEvent, navigate);
});

onUnmounted(() => {
  events.off(LockScreenEvent, lockScreen);
  events.off(RootNavigationEvent, navigate);
});

const router = useIonRouter();

function lockScreen() {
  router.navigate(
    { name: 'lock' },
    'forward',
    'push',
  );
}

function navigate(
  location: any,
  routerDirection: RouteDirection = 'forward',
  routerAction: RouteAction = 'push',
  routerAnimation?: AnimationBuilder
) {
  router.navigate(
    location,
    routerDirection,
    routerAction,
    routerAnimation
  );
}
</script>
