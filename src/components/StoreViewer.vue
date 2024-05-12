<script setup lang="ts">
import {
  accessTokenStorage,
  accountsStorage, currentPlatform, currentPlatforms,
  encMasterStorage,
  encSecretStorage,
  isLogin,
  kekStorage,
  mainStore,
  refreshTokenStorage,
  saltStorage,
  userStorage,
} from '@/store/main-store';
import { enableBiometricsOption } from '@/store/options-store';
import { computed, reactive } from 'vue';

const options = computed(() => {
  return {
    enableBiometricsOption: enableBiometricsOption.value
  };
});

const platforms = computed(() => {
  return {
    currentPlatform: currentPlatform.value,
    currentPlatforms: currentPlatforms.value,
  };
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
    platforms,
    options,
  )"></div>
</template>

<style scoped>

</style>
