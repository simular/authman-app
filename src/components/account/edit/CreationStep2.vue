<script setup lang="ts">

import LogoSelect from '@/components/account/edit/LogoSelect.vue';
import ModalLayout from '@/components/layout/ModalLayout.vue';
import accountService from '@/service/account-service';
import { mainStore, userStorage } from '@/store/main-store';
import { Account } from '@/types';
import useLoading from '@/utilities/loading';
import { IonButton, IonSpinner, modalController } from '@ionic/vue';
import dayjs from 'dayjs';
import { uuidv7 } from 'uuidv7';
import { ref } from 'vue';

const props = defineProps<{
  secret: string;
  title: string;
  host: string;
}>();

const logo = ref('');
const { loading: saving, run: runSave } = useLoading();

async function save() {
  const user = userStorage.value!;

  const account: Account = {
    id: uuidv7(),
    userId: user.id,
    content: {
      title: props.title,
      secret: props.secret,
      url: props.host,
      image: logo.value,
    },
    image: '',
    created: dayjs().toISOString(),
    modified: null,
    params: {},
  };

  await runSave(async () => {
    await accountService.save(account);

    mainStore.decryptedAccounts.unshift(account);

    await modalController.dismiss();

    setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent('open.account', { detail: { id: account.id } })
      );
    }, 300);
  });
}
</script>

<template>
  <ModalLayout title="Select Logo">
    <div class="box-center ion-padding" style="height: 100%;">
      <div style="width: 85%">
        <LogoSelect v-model="logo" />

        <div style="margin-top: 2rem">
          <ion-button expand="block" @click="save"
            :disabled="saving">
            <template v-if="saving">
              <ion-spinner name="dots" />
            </template>
            <template v-else>
              Create
            </template>
          </ion-button>
        </div>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped lang="scss">

</style>
