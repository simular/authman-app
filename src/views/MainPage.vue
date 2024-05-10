<template>
  <ion-page>
    <ion-split-pane content-id="main-body">
      <SideMenu v-if="isDesktop" />
      <ion-page id="main-body">
        <ion-tabs>
          <ion-router-outlet></ion-router-outlet>
          <ion-tab-bar v-if="isMobile" slot="bottom">
            <ion-tab-button tab="tab1" href="/pages/accounts">
              <ion-icon aria-hidden="true" :icon="people" />
              <ion-label>Accounts</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="tab2" href="/pages/options">
              <ion-icon aria-hidden="true" :icon="cog" />
              <ion-label>Options</ion-label>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </ion-page>
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue';
import { isDesktop, isMobile } from '@/store/main-store';
import {
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet,
  IonSplitPane,
} from '@ionic/vue';
import { cog, people } from 'ionicons/icons';
</script>
