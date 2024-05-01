<script setup lang="ts">

import MainLayout from '@/components/layout/MainLayout.vue';
import logo from '@/assets/images/logo-h-dark.svg';
import { App, AppInfo } from '@capacitor/app';
import { IonImg, IonItem, IonLabel, IonList, IonNote } from '@ionic/vue';
import { onMounted, ref } from 'vue';

const appInfo = ref<AppInfo>();
const website = import.meta.env.VITE_INFO_WEBSITE || '';
const poweredBy = import.meta.env.VITE_INFO_POWERED_BY || '';
const poweredByUrl = import.meta.env.VITE_INFO_POWERED_BY_URL || '';

onMounted(async () => {
  appInfo.value = await App.getInfo();
});

</script>

<template>
<MainLayout title="About Authman" color="light"
  default-back="options">
  <div class="l-content">
    <div class="l-content__logo">
      <ion-img :src="logo" style="max-width: 550px;" />
    </div>

    <ion-list inset>
      <ion-item>
        <ion-label>Version</ion-label>
        <span>
          {{ appInfo?.version }}
        </span>
      </ion-item>
      <ion-item>
        <ion-label>Build</ion-label>
        <span>
          {{ appInfo?.build }}
        </span>
      </ion-item>
    </ion-list>

    <ion-list inset>
      <ion-item button :href="website" target="_blank">
        <ion-label>
          <h4>Website</h4>
          <ion-note>{{ website }}</ion-note>
        </ion-label>

      </ion-item>
      <ion-item button :href="poweredByUrl" target="_blank">
        <ion-label>
          <h4>Powered By</h4>
          <ion-note>{{ poweredBy }}</ion-note>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>
</MainLayout>
</template>

<style scoped lang="scss">
.l-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__logo {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>
