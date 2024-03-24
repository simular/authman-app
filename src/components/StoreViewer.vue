<script setup lang="ts">
import {
  accessTokenStorage,
  accountsStorage,
  encMasterStorage,
  encSecretStorage,
  isLogin,
  kekStorage, mainStore,
  refreshTokenStorage, saltStorage,
  userStorage,
} from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { reactive } from 'vue';

const options = reactive({
  enableBiometricsOption,
});

function store(...args: any[]) {
  return 'store-viewer';
}

</script>

<template>
  <div :class="store(
    accessTokenStorage,
    accountsStorage,
    encMasterStorage,
    encSecretStorage,
    isLogin,
    kekStorage,
    saltStorage,
    mainStore,
    refreshTokenStorage,
    userStorage,
    options,
  )"></div>
</template>

<style scoped>

</style>
