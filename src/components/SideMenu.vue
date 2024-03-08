<script setup lang="ts">
import MenuLayout from '@/components/layout/MenuLayout.vue';
import MenuItem from '@/components/MenuItem.vue';
import { IonList } from '@ionic/vue';
import { people, cog, logOut } from 'ionicons/icons';

</script>

<template>
  <MenuLayout content-id="main-body">
    <ion-list :inset="false">
      <!-- Accounts -->
      <MenuItem href="/pages/accounts" :icon="people">
        Accounts
      </MenuItem>

      <!-- Options -->
      <MenuItem href="/pages/options" :icon="cog">
        Options
      </MenuItem>
    </ion-list>
  </MenuLayout>
</template>

<style scoped>

</style>
