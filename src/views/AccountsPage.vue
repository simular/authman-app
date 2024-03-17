<template>
  <MainLayout>
    <ExploreContainer name="Accounts" />
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import apiClient from '@/service/api-client';
import { onMounted } from 'vue';

onMounted(async () => {
  const res = await apiClient.get('account/list');

  console.log(res.data);
});

</script>
