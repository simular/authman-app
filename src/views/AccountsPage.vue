<template>
  <MainLayout>
    <ion-card v-if="active">
      <ion-card-content style="height: 300px">
        <AccountToken :item="active" />
      </ion-card-content>
    </ion-card>

    <ion-grid>
      <ion-row>
        <ion-col size="6" size-md="4" size-lg="3"
          v-for="item of items" :key="item.id">
          <ion-card>
            <ion-card-content>
              <div>
                <img :src="item.content.icon" alt="img">
              </div>
              <h4>{{ item.content.title }}</h4>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>
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
import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';

const items = computed(() => accountsStorage.value);
const active = ref<Account>();

onMounted(async () => {
  await loadAccounts();

  if (!active.value) {
    active.value = items.value[0];
  }
});

async function loadAccounts() {
  const res = await apiClient.get<{
    data: {
      items: Account<string>[];
    }
  }>('account/list');

  accountsStorage.value = await prepareAccounts(res.data.data.items);
}

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

</script>
