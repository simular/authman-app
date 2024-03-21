<template>
  <MainLayout>
    <template #end>
      <ion-buttons>
        <ion-button>
          <FontAwesomeIcon :icon="faCheckCircle" style="margin-right: .25rem" />
          <span>Select</span>
        </ion-button>

        <ion-button @click="createAccount">
          <FontAwesomeIcon :icon="faPlus" style="margin-right: .25rem" />
          <span>New</span>
        </ion-button>
      </ion-buttons>
    </template>

    <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>

    <ion-searchbar :animated="true" placeholder="Search" v-model="q"
      autocapitalize="none"></ion-searchbar>

    <ion-grid>
      <ion-row>
        <ion-col v-for="item of items" :key="item.id"
          size="6" size-md="4" size-lg="3"
        >

          <!-- Account Card -->
          <ion-card @click="selectAccount(item)"
            button
            style="margin: 0; height: 100%">
            <ion-card-content>
              <div class="ion-text-center ion-padding">
                <img :src="item.image" alt="img" style="width: 56px; aspect-ratio: 1">
              </div>
              <div class="line-clamp">
                <h4>{{ item.content.title }}</h4>
              </div>
            </ion-card-content>
          </ion-card>

        </ion-col>
      </ion-row>
    </ion-grid>

    <!-- Account Page Modal -->
    <ion-modal
      class="account-modal"
      :is-open="accountModalOpen"
      @didDismiss="active = undefined"
    >
      <ion-content class="ion-padding" v-if="active"
        :scroll-y="false">
        <div class="box-center" style="height: 100%">
          <AccountToken :item="active" />
        </div>
      </ion-content>
    </ion-modal>

    <!-- Account New Modal -->
    <ion-modal
      class="new-modal"
      :is-open="newModalOpen"
      @didDismiss="newModalOpen = false"
    >
      <NewAccountNav />
    </ion-modal>
  </MainLayout>
</template>

<script setup lang="ts">
import NewAccountNav from '@/components/account/NewAccountNav.vue';
import AccountToken from '@/components/AccountToken.vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import accountService from '@/service/account-service';
import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import {
  accountsStorage,
  encMasterStorage,
  encSecretStorage,
  kekStorage,
} from '@/store/main-store';
import { Account, AccountContent } from '@/types';
import { base64UrlDecode, uint82text } from '@/utilities/convert';
import secretToolkit from '@/utilities/secret-toolkit';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonModal, IonRefresher, IonRefresherContent,
  IonRow,
  IonSearchbar, RefresherCustomEvent,
} from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';

const decryptedAccounts = ref<Account[]>([]);
const items = computed(() => {
  let accounts = decryptedAccounts.value;

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
  decryptedAccounts.value = await accountService.getDecryptedAccounts();
});

async function handleRefresh(e: RefresherCustomEvent) {
  try {
    await accountService.loadAccounts();
  } finally {
    e.target.complete();
  }
}

// Prepare
// async function decryptAccounts(items: Account<string>[]): Promise<Account[]> {
//   const master = await encryptionService.getMasterKey();
//
//   let accounts = [];
//
//   for (const item of items) {
//     const account = await accountService.decryptAccount(item, master);
//
//     accounts.push(account);
//   }
//
//   return accounts;
// }

// Select account
const accountModalOpen = computed(() => active.value != undefined);

function selectAccount(account: Account) {
  active.value = account;
}

// Account New
const newModalOpen = ref(false);

function createAccount() {
  newModalOpen.value = true;
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
