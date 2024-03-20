<script setup lang="ts">
import AccountCreation from '@/components/account/new/AccountCreation.vue';
import { IonNav } from '@ionic/vue';
import { provide, ref } from 'vue';

const nav = ref<HTMLIonNavElement>();

provide('nav', nav);
</script>

<template>
<ion-nav ref="nav" :root="AccountCreation">

</ion-nav>
</template>

<style scoped>

</style>
