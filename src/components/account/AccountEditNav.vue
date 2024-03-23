<script setup lang="ts">
import { Account } from '@/types';
import { IonNav } from '@ionic/vue';
import { type ComponentPublicInstance, computed, provide, ref } from 'vue';

const props = defineProps<{
  isEdit: boolean;
  account?: Account;
}>();

const nav = ref<ComponentPublicInstance<typeof IonNav>>();
const navComponent = computed<HTMLIonNavElement>(() => nav.value?.$el);

provide('nav', navComponent);
provide('account', props.account);

const root = props.isEdit
  ? (await import('@/components/account/edit/AccountEdit.vue')).default
  : (await import('@/components/account/edit/CreationStep1.vue')).default

</script>

<template>
<ion-nav ref="nav" :root>

</ion-nav>
</template>

<style scoped>

</style>
