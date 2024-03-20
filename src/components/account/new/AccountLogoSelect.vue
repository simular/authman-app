<script setup lang="ts">

import ModalLayout from '@/components/layout/ModalLayout.vue';
import apiClient from '@/service/api-client';
import { simpleAlert } from '@/utilities/alert';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonButton, IonSearchbar, onIonViewDidEnter } from '@ionic/vue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  secret: string;
  title: string;
  host: string;
}>();

const q = ref('');

console.log(props);

onMounted(async () => {
  logo.value = await findFontAwesome('key');
});

const logo = ref('');

async function searchIcon() {
  const img = await findFontAwesome(q.value);

  if (img) {
    logo.value = img;
  }
}

async function findFontAwesome(q: string) {
  const res = await apiClient.get(
    'account/logo/search',
    {
      params: {
        q
      }
    }
  );

 return res.data.data?.image || null;
}

async function pasteImage() {
  const items = await navigator.clipboard.read();

  let types = items[0].types;

  if (types.length === 0) {
    simpleAlert('Unable to get clipboard data.');
    return;
  }

  types = types.slice().sort();

  const type = types[0];
  const blob = await items[0].getType(type);
  const file = new File([ blob ], 'image.png', { type });

  const promise = new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      resolve(event.target?.result as string);
    });

    reader.readAsDataURL(file);
  });

  logo.value = await promise;
}
</script>

<template>
<ModalLayout title="Select Logo">
  <div class="box-center ion-padding" style="height: 100%">
    <div style="width: 100%">
      <div class="ion-text-center" style="margin-bottom: 2rem">
        <div style="display: inline-block; border: 1px solid white; border-radius: 5px"
          class="ion-padding">
          <img :src="logo" alt="logo" style="width: 64px; height: 64px; object-fit: contain">
        </div>
      </div>

      <div class="ion-text-center">
        <div style="margin-bottom: .5rem; width: 100%; display: flex; justify-content: center">
          <ion-searchbar autocapitalize="none" v-model="q" placeholder="Search FontAwesome"
          style="width: 85%" />
        </div>

        <ion-button @click="searchIcon" fill="outline" color="dark"
          style="width: 150px"
          :disabled="q === ''">
          Search
        </ion-button>
      </div>

      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: .75rem">
        <ion-button fill="outline" color="dark"
          @click="pasteImage">
          <FontAwesomeIcon :icon="faClipboard" style="margin-right: .5rem" />
          Paste
        </ion-button>
        <ion-button fill="outline" color="dark">
          <FontAwesomeIcon :icon="faUpload" style="margin-right: .5rem" />
          Upload
        </ion-button>
      </div>
    </div>
  </div>
</ModalLayout>
</template>

<style scoped>

</style>
