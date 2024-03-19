<template>
  <MainLayout>
    <ion-searchbar :animated="true" placeholder="Search" v-model="q"></ion-searchbar>

    <ion-grid>
      <ion-row>
        <ion-col size="6" size-md="4" size-lg="3"
          v-for="item of items" :key="item.id">
          <ion-card @click="selectAccount(item)"
          style="margin: 0; height: 100%">
            <ion-card-content>
              <div class="ion-text-center ion-padding">
                <img :src="item.content.icon" alt="img" style="width: 56px; aspect-ratio: 1">
              </div>
              <div class="line-clamp">
                <h4>{{ item.content.title }}</h4>
              </div>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>

    <ion-modal
      class="account-modal"
      :is-open="modalOpen"
      @didDismiss="active = undefined"
    >
      <ion-content class="ion-padding" v-if="active"
        :scroll-y="false">
        <div class="box-center" style="height: 100%">
          <AccountToken :item="active" />
        </div>
      </ion-content>
    </ion-modal>
  </MainLayout>
</template>

<script setup lang="ts">
import AccountToken from '@/components/AccountToken.vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import { accountsStorage, encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { Account, AccountContent } from '@/types';
import { base64UrlDecode, uint82text } from '@/utilities/convert';
import secretToolkit from '@/utilities/secret-toolkit';
import { IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonModal, IonRow, IonSearchbar } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';

const items = computed(() => {
  let accounts = accountsStorage.value;

  if (q.value === '') {
    return accounts;
  }

  return accounts.filter((account) => {
    const content = account.content;
    const qi = q.value.toLowerCase();

    if (content.title.toLowerCase().includes(qi)) {
      return true;
    }

    if (content.url.toLowerCase().includes(qi)) {
      return true;
    }

    return false;
  });
});
const active = ref<Account>();

onMounted(async () => {
  await loadAccounts();
});

async function loadAccounts() {
  const res = await apiClient.get<{
    data: {
      items: Account<string>[];
    }
  }>('account/list');

  accountsStorage.value = await prepareAccounts(res.data.data.items);
}

// Prepare
async function prepareAccounts(items: Account<string>[]): Promise<Account[]> {
  const kek = kekStorage.value;
  const secret = await sodiumCipher.decrypt(base64UrlDecode(encSecretStorage.value), secretToolkit.decode(kek));
  const master = await sodiumCipher.decrypt(base64UrlDecode(encMasterStorage.value), secret);

  let accounts = [];

  for (const item of items) {
    const content = await sodiumCipher.decrypt(base64UrlDecode(item.content), master);

    const json = JSON.parse(uint82text(content)) as AccountContent;
    const account = item as any;
    account.content = json;

    accounts.push(account);
  }

  return accounts;
}

// Select account
const modalOpen = computed(() => active.value != undefined);

function selectAccount(account: Account) {
  active.value = account;
}

// Search
const q = ref('');

</script>

<style scoped lang="scss">
@media (max-width: 767px) or (max-height: 599px) {
  ion-modal.account-modal {
    --height: 400px;
    --width: 85%;
    --border-radius: 2px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
    //--border-radius: 16px;
    //--box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
}
</style>
