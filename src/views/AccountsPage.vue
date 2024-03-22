<template>
  <MainLayout>
    <template #end>
      <ion-buttons>
        <template v-if="selectMode">
          <ion-button @click="selectMode = false">
            <FontAwesomeIcon :icon="faCheckCircle" style="margin-right: .25rem" />
            <span>Cancel</span>
          </ion-button>
          <ion-button color="danger" @click="deleteAccounts(selectedAccounts)">
            <FontAwesomeIcon :icon="faTrash" style="margin-right: .25rem" />
            <span>Delete {{ selectedAccounts.length > 0 ? `(${selectedAccounts.length})` : '' }}</span>
          </ion-button>
        </template>
        <template v-else>
          <ion-button @click="selectMode = true">
            <FontAwesomeIcon :icon="faCheckCircle" style="margin-right: .25rem" />
            <span>Select</span>
          </ion-button>

          <ion-button @click="createAccount">
            <FontAwesomeIcon :icon="faPlus" style="margin-right: .25rem" />
            <span>New</span>
          </ion-button>
        </template>
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
            :color="isSelected(item.id) ? 'primary' : ''"
            button
            style="margin: 0; height: 100%">
            <ion-card-content>
              <div class="ion-text-center ion-padding">
                <img :src="item.content.image" alt="img" style="width: 56px; aspect-ratio: 1">
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
      <AccountModalBody v-if="active" :account="active"
        @edit=""
        @delete="deleteAccounts([active])"
      />
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
import NewAccountNav from '@/components/account/AccountEditNav.vue';
import AccountModalBody from '@/components/account/AccountModalBody.vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import accountService from '@/service/account-service';
import apiClient from '@/service/api-client';
import { mainStore } from '@/store/main-store';
import { Account } from '@/types';
import { simpleConfirm } from '@/utilities/alert';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSearchbar,
  modalController,
  RefresherCustomEvent,
} from '@ionic/vue';
import { refDebounced } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

// Search
const q = ref('');
const qDebounced = refDebounced(q, 500);
const items = computed(() => {
  let accounts = mainStore.decryptedAccounts;

  if (qDebounced.value === '') {
    return accounts;
  }

  return accounts.filter((account) => {
    const content = account.content;
    const qi = qDebounced.value.toLowerCase();

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
  selectMode.value = false;

  await accountService.loadAccounts();
});

async function handleRefresh(e: RefresherCustomEvent) {
  try {
    await accountService.loadAccounts();
  } finally {
    e.target.complete();
  }
}

// Open account
const accountModalOpen = computed(() => active.value != undefined);

function selectAccount(account: Account) {
  if (selectMode.value) {
    if (isSelected(account.id)) {
      selected.value = selected.value.filter((id) => id !== account.id);
    } else {
      selected.value.push(account.id);
    }

    return;
  }

  active.value = account;
}

const selectedAccounts = computed(() => {
  return items.value.filter((item) => {
    return isSelected(item.id);
  });
});

function isSelected(id: string) {
  return selected.value.includes(id);
}

// Account New
const newModalOpen = ref(false);

function createAccount() {
  newModalOpen.value = true;
}

// Select
const selectMode = ref(false);
const selected = ref<string[]>([]);

watch(selectMode, (v) => {
  if (!v) {
    selected.value = [];
  }
});

// CRUD
async function editAccount(account: Account) {

}

async function deleteAccounts(accounts: Account[]) {
  const v = await simpleConfirm(
    `Do you really want to delete?`,
    ' This action cannot redo.',
  );

  if (!v) {
    return;
  }

  const ids = accounts.map((item) => item.id);

  const res = await apiClient.delete('account/delete', { data: { ids } });

  mainStore.decryptedAccounts = mainStore.decryptedAccounts.filter((account) => {
    return !ids.includes(account.id);
  });

  modalController.dismiss();

  selectMode.value = false;
}

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
