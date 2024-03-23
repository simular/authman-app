<script setup lang="ts">
import {
  accessTokenStorage,
  accountsStorage,
  encMasterStorage,
  encSecretStorage,
  isLogin,
  kekStorage, mainStore,
  refreshTokenStorage,
  userStorage,
} from '@/store/main-store';

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
    kekStorage, mainStore,
    refreshTokenStorage,
    userStorage,
  )"></div>
</template>

<style scoped>

</style>
