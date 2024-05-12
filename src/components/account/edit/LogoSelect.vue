<script setup lang="ts">
import apiClient from '@/service/api-client';
import { isElectron } from '@/store/main-store';
import { simpleAlert, simpleToast } from '@/utilities/alert';
import useLoading from '@/utilities/loading';
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonButton, IonButtons, IonSearchbar, IonSpinner } from '@ionic/vue';
import { onMounted, ref, watch } from 'vue';

enum ImageSource {
  FONT_AWESOME,
  PASTE,
  UPLOAD,
  DEFAULT,
}

const logo = defineModel({ default: '' });
const q = ref('');
const imageSource = ref(ImageSource.DEFAULT);
const { loading, run } = useLoading();

onMounted(async () => {
  logo.value = logo.value || await findFontAwesome('key');
});

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
        color: currentColor.value,
      },
    },
  ));

  return res.data.data?.image || null;
}

// Colors
const colors = [
  '#f44336',
  '#e91e63',
  '#7e57c2',
  '#2196f3',
  '#009688',
  '#ffc107',
  '#ff9800',
  '#ffffff',
];

const currentColor = ref('#ffffff');

watch(currentColor, () => {
  searchIcon();
});

// Paste
async function pasteImage() {
  let imgDataUri: string | null = null;

  if (Capacitor.isNativePlatform() && !isElectron.value) {
    imgDataUri = await readImageFromDevice();
  } else {
    imgDataUri = await readImageFromBrowser();
  }

  if (!imgDataUri) {
    return;
  }

  logo.value = await resizeImage(imgDataUri);

  imageSource.value = ImageSource.PASTE;
}

async function readImageFromDevice() {
  const { type, value } = await Clipboard.read();

  if (!checkFileType([type])) {
    return null;
  }

  return value;
}

async function readImageFromBrowser(): Promise<string | null> {
  const items = await navigator.clipboard.read();

  let types = items[0].types;

  if (types.length === 0) {
    simpleAlert('Unable to get clipboard data.');
    return null;
  }

  types = types.slice().sort();

  if (!checkFileType(types)) {
    return null;
  }

  const type = types[0];
  const blob = await items[0].getType(type);
  const file = new File([blob], 'image.png', { type });

  return await readFileAsBase64(file);
}

// Upload
async function pickImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  const promise = new Promise<File | undefined>((resolve) => {
    input.addEventListener('change', (e) => {
      const file = input.files?.[0];

      resolve(file);
    });

    input.click();
  });

  const file = await promise;

  if (!file) {
    return;
  }

  if (!checkFileType([file.type])) {
    return;
  }

  logo.value = await resizeImage(await readFileAsBase64(file));

  imageSource.value = ImageSource.UPLOAD;
}

function checkFileType(types: readonly string[]) {
  for (const type of types) {
    if (type.startsWith('image/')) {
      return true;
    }
  }

  return false;
}

async function readFileAsBase64(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      resolve(event.target?.result as string);
    });

    reader.readAsDataURL(file);
  });
}

async function resizeImage(imgDataUri: string) {
  return new Promise<string>((resolve) => {
    const img = document.createElement('img');
    img.addEventListener('load', (evt) => {
      const canvas = document.createElement("canvas");

      let width = img.width;
      let height = img.height;
      let x = 0;
      let y = 0;

      if (width > height) {
        canvas.width = 120;
        canvas.height = 120 / width * height;
      } else {
        canvas.width = 96;
        canvas.height = 96;
      }

      const ctx = canvas.getContext("2d")!;

      const maxWidth = canvas.width;
      const maxHeight = canvas.height;

      // Resize
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
          y = (maxHeight - height) / 2;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
          x = (maxWidth - width) / 2;
        }
      }

      // Actual resizing
      ctx.drawImage(img, x, y, width, height);

      // Show resized image in preview element
      const dataUri = canvas.toDataURL('image/png');

      resolve(dataUri);
    });
    img.src = imgDataUri;
  });
}
</script>

<template>
  <div class="" :class="{ 'h-loading': loading }" style="height: 100%">
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
          <ion-searchbar autocapitalize="none" v-model="q" placeholder="Search Icon (FontAwesome)"
            color="medium"
            style="" />
        </div>

        <ion-button @click="searchIcon" fill="outline" color="dark"
          style="width: 150px"
          :disabled="q === ''">
          Search
        </ion-button>
      </div>

      <div class="l-logo-select__colors"
        style="display: flex; justify-content: center; margin-top: .75rem">
        <ion-buttons>
          <ion-button v-for="color of colors"
            :key="color"
            style="width: 30px"
            :style="{ '--background': color }"
            :active="currentColor === color"
            @click="currentColor = color"
            :disabled="!(imageSource === ImageSource.FONT_AWESOME || imageSource === ImageSource.DEFAULT)"
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
        <ion-button fill="outline" color="dark"
          @click="pickImage">
          <FontAwesomeIcon :icon="faUpload" style="margin-right: .5rem" />
          Upload
        </ion-button>
      </div>
    </div>
  </div>
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
