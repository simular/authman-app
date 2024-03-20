<script setup lang="ts">

import ModalLayout from '@/components/layout/ModalLayout.vue';
import apiClient from '@/service/api-client';
import { simpleAlert, simpleToast } from '@/utilities/alert';
import useLoading from '@/utilities/loading';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonButton, IonButtons, IonSearchbar, IonSpinner } from '@ionic/vue';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  secret: string;
  title: string;
  host: string;
}>();

enum ImageSource {
  FONT_AWESOME,
  PASTE,
  UPLOAD,
  DEFAULT,
}

const q = ref('');
const imageSource = ref(ImageSource.DEFAULT);
const { loading, run } = useLoading();

onMounted(async () => {
  logo.value = await findFontAwesome('key');
});

const logo = ref('');
const emptyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function searchIcon() {
  const img = await findFontAwesome(q.value);

  if (img) {
    logo.value = img;
    imageSource.value = ImageSource.FONT_AWESOME;
  } else {
    simpleToast('Icon not found.', 'top');
  }
}

async function findFontAwesome(q: string) {
  const res = await run(() => apiClient.get(
    'account/logo/search',
    {
      params: {
        q,
        color: currentColor.value
      }
    }
  ));

  return res.data.data?.image || null;
}

// Colors
const colors = [
  '#f44336',
  '#e91e63',
  '#9C27B0',
  '#2196f3',
  '#009688',
  '#ffc107',
  '#FF9800',
  '#ffffff',
];

const currentColor = ref('#ffffff');

watch(currentColor, () => {
  searchIcon();
});

// Paste
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
  const file = new File([blob], 'image.png', { type });

  const promise = new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      resolve(event.target?.result as string);
    });

    reader.readAsDataURL(file);
  });

  logo.value = await promise;

  imageSource.value = ImageSource.PASTE;
}

// Upload
async function upload() {
  
}
</script>

<template>
  <ModalLayout title="Select Logo">
    <div class="box-center ion-padding" :class="{ 'h-loading': loading }" style="height: 100%">
      <div class="l-logo-select" style="width: 100%">
        <div class="ion-text-center l-logo-select__preview" style="margin-bottom: 1rem">
          <div class="ion-padding c-logo-preview">
            <img class="c-logo-preview__img" :src="logo || emptyImage" alt="logo" style="">

            <ion-spinner v-if="loading"
              class="c-logo-preview__spinner"
              name="crescent"
            ></ion-spinner>
          </div>
        </div>

        <div class="ion-text-center l-logo-select__search">
          <div style="margin-bottom: .5rem; width: 100%; display: flex; justify-content: center">
            <ion-searchbar autocapitalize="none" v-model="q" placeholder="Search FontAwesome"
              color="medium"
              style="width: 85%" />
          </div>

          <ion-button @click="searchIcon" fill="outline" color="dark"
            style="width: 150px"
            :disabled="q === ''">
            Search
          </ion-button>
        </div>

        <div class="l-logo-select__colors" style="display: flex; justify-content: center; margin-top: .75rem">
          <ion-buttons>
            <ion-button v-for="color of colors"
              :key="color"
              style="width: 30px"
              :style="{ '--background': color }"
              :active="currentColor === color"
              @click="currentColor = color"
              :disabled="imageSource !== ImageSource.FONT_AWESOME"
            >
            </ion-button>
          </ion-buttons>
        </div>

        <hr />

        <div class="l-logo-select__toolbar"
          style="margin-top: 1.5rem; display: flex; justify-content: center; gap: .75rem">
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

<style scoped lang="scss">
.c-logo-preview {
  display: inline-block;
  border: 1px solid white;
  border-radius: 5px;
  position: relative;

  &__img {
    width: 64px;
    height: 64px;
    object-fit: contain;
    transition: .3s;
  }

  &__spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.h-loading {
  .c-logo-preview__img {
    opacity: .5;
  }
}
</style>
