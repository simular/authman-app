<template>
  <MainLayout>
    <ExploreContainer name="Accounts" />
  </MainLayout>
</template>

<script setup lang="ts">
import ExploreContainer from '@/components/ExploreContainer.vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import { accountsStorage, encMasterStorage, encSecretStorage, kekStorage } from '@/store/main-store';
import { Account, AccountContent } from '@/types';
import { base64UrlDecode, uint82text } from '@/utilities/convert';
import secretToolkit from '@/utilities/secret-toolkit';
import { computed, onMounted } from 'vue';

const items = computed(() => accountsStorage.value);

onMounted(async () => {
  loadAccounts();
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
  console.log(accounts);
  return accounts;
}

</script>
