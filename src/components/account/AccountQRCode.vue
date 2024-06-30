<script setup lang="ts">
import { Account } from '@/types';
import QRCode from 'qrcode';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  item: Account;
}>();

const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const url = props.item.content.url;
  const title = encodeURIComponent(props.item.content.title);
  const secret = props.item.content.secret;
  const issuer = props.item.content?.issuer || '';

  const uri = `otpauth://${url}/${title}?secret=${secret}&issuer=${issuer}`;

  QRCode.toCanvas(canvas.value!, uri);
});
</script>

<template>
<div>
  <div class="l-qrcode-container">
    <h4>{{ item.content.title }}</h4>
    <canvas ref="canvas" style="max-width: 230px; max-height: 230px; aspect-ratio: 1" />
  </div>
</div>
</template>

<style scoped>
.l-qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  h4 {
    margin-bottom: 1rem;
    text-align: center;
  }
}
</style>
