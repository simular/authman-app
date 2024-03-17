<script setup lang="ts">
import {
  accessTokenStorage, accountsStorage, encMasterStorage,
  encSecretStorage,
  isLogin,
  kekStorage,
  refreshTokenStorage,
  userStorage
} from '@/store/main-store';

defineExpose({
  accessTokenStorage,
  refreshTokenStorage,
  userStorage,
  isLogin,
  encSecretStorage,
  encMasterStorage,
  kekStorage,
  accountsStorage,
});
</script>

<template>
  <template></template>
</template>

<style scoped>

</style>
