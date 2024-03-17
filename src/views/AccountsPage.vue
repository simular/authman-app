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
import { accountsStorage, encSecretStorage, kekStorage, userStorage } from '@/store/main-store';
import { Account } from '@/types';
import { base64UrlDecode, blobToBase64Uri } from '@/utilities/convert';
import secretToolkit from '@/utilities/secret-toolkit';
import { computed, onMounted, ref } from 'vue';

const items = computed(() => accountsStorage.value);

onMounted(async () => {
  loadAccounts();

  const kek = kekStorage.value;
  console.log(
    encSecretStorage.value,
    secretToolkit.decode(encSecretStorage.value)
  );
  const secret = await sodiumCipher.decrypt(secretToolkit.decode(encSecretStorage.value), secretToolkit.decode(kek));

  console.log(secret);
});

async function loadAccounts() {
  const res = await apiClient.get<{
    data: {
      items: Account[];
    }
  }>('account/list');

  accountsStorage.value = await prepareAccounts(res.data.data.items);
}

async function prepareAccounts(items: Account[]): Promise<Account[]> {
  for (const item of items) {
    if (item.icon) {
      const res = await fetch(item.icon);
      const blob = await res.blob();

      item.icon = await blobToBase64Uri(blob);
    }
  }

  return items;
}

</script>
