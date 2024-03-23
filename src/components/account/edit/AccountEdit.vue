<script setup lang="ts">
import LogoSelect from '@/components/account/edit/LogoSelect.vue';
import ModalLayout from '@/components/layout/ModalLayout.vue';
import accountService from '@/service/account-service';
import { Account } from '@/types';
import useLoading from '@/utilities/loading';
import { IonButton, IonInput, IonItem, IonList, IonSpinner, modalController } from '@ionic/vue';
import dayjs from 'dayjs';
import { inject, ref } from 'vue';

const account = inject<Account>('account')!;

const title = ref(account.content.title);
const logo = ref(account.content.image);

const { loading: saving, run: runSave } = useLoading();

async function save() {
  account.content.title = title.value;
  account.content.image = logo.value;
  account.modified = dayjs().toISOString();

  await runSave(async () => {
    await accountService.save(account);
  });

  modalController.dismiss();
}

</script>

<template>
<ModalLayout title="Account Edit">
  <div class="ion-padding page-center">
    <div>
      <div style="margin-bottom: 2rem">
        <ion-list>
          <ion-item>
            <ion-input label="Title" label-placement="stacked"
              v-model="title" />
          </ion-item>
        </ion-list>
      </div>

      <LogoSelect v-model="logo" />

      <div style="margin-top: 2rem">
        <ion-button expand="block" @click="save"
          :disabled="saving">
          <template v-if="saving">
            <ion-spinner name="dots" />
          </template>
          <template v-else>
            Save
          </template>
        </ion-button>
      </div>
    </div>
  </div>
</ModalLayout>
</template>

<style scoped>

</style>
