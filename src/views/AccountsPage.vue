<template>
  <MainLayout show-menu-button>
    <template #secondary>
      <ion-buttons>
        <template v-if="selectMode">
          <ion-button @click="selectMode = false">
            <FontAwesomeIcon :icon="faCheckCircle" style="margin-right: .25rem" />
            <span>Cancel</span>
          </ion-button>
        </template>
        <template v-else>
          <ion-button @click="selectMode = true">
            <FontAwesomeIcon :icon="faCheckCircle" style="margin-right: .25rem" />
            <span>Edit</span>
          </ion-button>
        </template>
      </ion-buttons>
    </template>

    <template #primary>
      <ion-buttons>
        <template v-if="selectMode">
          <ion-button color="danger" @click="deleteAccounts(selectedAccounts)"
            :disabled="selectedAccounts.length === 0">
            <FontAwesomeIcon :icon="faTrash" style="margin-right: .25rem" />
            <span>Delete {{ selectedAccounts.length > 0 ? `(${selectedAccounts.length})` : '' }}</span>
          </ion-button>
        </template>
        <template v-else>
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
            class="c-account-card"
            button
            :class="{ active: isSelected(item.id) }">
            <!-- Checkbox -->
            <ion-checkbox v-if="selectMode"
              class="c-account-card__checkbox"
              :checked="isSelected(item.id)"
            />

            <!-- Card Content -->
            <ion-card-content>
              <div class="c-account-card__icon ion-text-center ion-padding">
                <img :src="item.content.image" alt="img">
              </div>
              <div class="c-account-card__title line-clamp"
                style="text-align: center">
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
        @edit="editAccount(active)"
        @delete="deleteAccounts([active])"
      />
    </ion-modal>

    <!-- Account New Modal -->
    <ion-modal
      class="new-modal"
      :is-open="editModalOpen"
      @didDismiss="editModalDismissed"
    >
      <Suspense>
        <AccountEditNav v-if="editModalOpen" :is-edit="isEdit"
          :account="editingAccount"
        />
      </Suspense>
    </ion-modal>
  </MainLayout>
</template>

<script setup lang="ts">
import AccountEditNav from '@/components/account/AccountEditNav.vue';
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
  IonCardContent, IonCheckbox,
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Search
const q = ref('');
const qDebounced = refDebounced(q, 500);
const items = computed(() => {
  let accounts = mainStore.decryptedAccounts;

  accounts = accounts.sort((a, b) => {
    return a.content.title.localeCompare(b.content.title);
  });

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
onMounted(() => {
  document.addEventListener('open.account', openAccountByEvent);
});

onUnmounted(() => {
  document.removeEventListener('open.account', openAccountByEvent);
});

const accountModalOpen = computed(() => active.value != undefined);

function openAccountByEvent(e: Event) {
  if (e instanceof CustomEvent) {
    openAccountById(e.detail.id);
  }
}

function openAccountById(id: string) {
  const account = mainStore.decryptedAccounts.find((account) => account.id === id);

  if (account) {
    selectAccount(account);
  }
}

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

// Select
const selectMode = ref(false);
const selected = ref<string[]>([]);

watch(selectMode, (v) => {
  if (!v) {
    selected.value = [];
  }
});

// CRUD
// Account New
const editModalOpen = ref(false);
const isEdit = ref(false);
const editingAccount = ref<Account>();

function createAccount() {
  isEdit.value = false;
  editModalOpen.value = true;
}

function editModalDismissed() {
  editModalOpen.value = false;

  setTimeout(() => {
    isEdit.value = false;
    editingAccount.value = undefined;
  }, 500);
}

async function editAccount(account: Account) {
  await modalController.dismiss();

  editingAccount.value = account;
  isEdit.value = true;
  editModalOpen.value = true;
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

.c-account-card {
  margin: 0;
  height: 100%;

  &.active {
    box-shadow: 0 0 2px 1px rgba(var(--ion-color-primary-rgb), .75);
  }

  &__checkbox {
    position: absolute;
    left: .5rem;
    top: .5rem
  }

  &__icon img {
    width: 120px;
    height: 56px;
    object-fit: contain;
  }
}
</style>
