<script setup lang="ts">
import ModalLayout from '@/components/layout/ModalLayout.vue';
import userService from '@/service/user-service';
import { simpleAlert } from '@/utilities/alert';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IonButton, IonInput, IonItem, IonList, modalController, useIonRouter } from '@ionic/vue';
import { AxiosError } from 'axios';
import { trimStart } from 'lodash-es';
import { ComputedRef, inject, onMounted, ref } from 'vue';

const nav = inject<ComputedRef<HTMLIonNavElement>>('nav');

const secretInput = ref<typeof IonInput>();
const secret = ref('');
const title = ref('');
const host = ref('');

onMounted(async () => {
  try {
    await userService.touch();
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.code === 'ERR_NETWORK') {
        simpleAlert('To create a new account, network connection is required.');
        modalController.dismiss();
      }
    }
  }

  setTimeout(() => {
    secretInput.value?.$el.setFocus();
  }, 500);
});

async function scanQRCode() {
  // decodeTheUri('otpauth://discord.com/URHOUSE%20%E5%AE%B6%E5%90%88%E4%B8%8D%E5%8B%95%E7%94%A2?secret=KADMZDJH7Y');
  // return;

  if (!await requestPermission()) {
    await permissionAlert();
    BarcodeScanner.openAppSettings();
    return;
  }

  document.querySelector('body')?.classList.add('scanner-active');

  BarcodeScanner.hideBackground();

  addClosEvent();

  const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

  if (result.hasContent) {
    decodeTheUri(result.content);
  }

  endScan();
}

async function requestPermission() {
  const result = await BarcodeScanner.checkPermission({ force: true });

  return Boolean(result.granted || result.neverAsked);
}

function permissionAlert() {
  return simpleAlert(
    'Permission denied',
    'Please grant camera permission to use the QRCode scanner.',
  );
}

function stopScan() {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
  endScan();
}

function endScan() {
  document.querySelector('body')?.removeEventListener('click', stopScan);

  document.querySelector('body')?.classList.remove('scanner-active');
}

function addClosEvent() {
  document.querySelector('body')?.addEventListener('click', stopScan);
}

function decodeTheUri(uri: string) {
  const url = new URL(uri);

  if (url.protocol !== 'otpauth:') {
    simpleAlert('Wrong account URI');
    return;
  }

  const path = trimStart(url.pathname, '/').split('/');

  host.value = path[0];
  secret.value = url.searchParams.get('secret') || '';
  title.value = decodeURIComponent(String(path[1])) || '';
}

const saving = ref(false);

async function next() {
  if (!secret.value) {
    return;
  }

  const AccountLogoSelect = (await import('@/components/account/edit/CreationStep2.vue')).default;

  saving.value = true;

  nav?.value.push(
    AccountLogoSelect,
    {
      secret: secret.value,
      title: title.value,
      host: host.value,
    },
  );

  setTimeout(() => {
    saving.value = false;
  }, 1500);
}
</script>

<template>
  <ModalLayout title="Create an account">

    <div class="box-center ion-padding" style="height: 100%; flex-direction: column; gap: 1.5rem">
      <div>
        <ion-button fill="outline" color="dark" @click="scanQRCode">
          <div>
            <FontAwesomeIcon :icon="faQrcode" size="7x" />
            <div style="margin-top: .5rem">
              Scan QRCode
            </div>
          </div>
        </ion-button>
      </div>

      <div style="width: 75%">
        <ion-list>
          <ion-item>
            <ion-input label="Or entering secret"
              type="text"
              fill="solid"
              label-placement="stacked"
              ref="secretInput"
              v-model="secret"
            />
          </ion-item>

          <ion-item>
            <ion-input label="Title"
              type="text"
              fill="solid"
              label-placement="stacked"
              v-model="title"
            />
          </ion-item>
        </ion-list>
      </div>

      <ion-button expand="block" style="width: 75%"
        @click="next"
        :disabled="secret === '' || title === '' || saving"
      >
        Next
      </ion-button>
    </div>

    <!--  <div class="scanner-ui">-->
    <!--    <video id="video" style="width: 100%; height: 500px" autoplay muted playsinline></video>-->
    <!--  </div>-->

  </ModalLayout>
</template>

<style scoped>

</style>
