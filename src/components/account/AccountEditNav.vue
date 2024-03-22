<script setup lang="ts">
import AccountCreation from '@/components/account/edit/CreationStep1.vue';
import { IonNav } from '@ionic/vue';
import { type ComponentPublicInstance, computed, provide, ref } from 'vue';

const nav = ref<ComponentPublicInstance<typeof IonNav>>();
const navComponent = computed<HTMLIonNavElement>(() => nav.value?.$el);

provide('nav', navComponent);

</script>

<template>
<ion-nav ref="nav" :root="AccountCreation">

</ion-nav>
</template>

<style scoped>

</style>
