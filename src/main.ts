import electronService from '@/service/electron-service';
import {
  currentPlatform,
  currentPlatforms, idleTimeoutEnabled, isElectron, isLock,
  isLogin,
  isNative, lockAtStartup,
} from '@/store/main-store';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import sodium from 'libsodium-wrappers-sumo';
import { createApp, nextTick } from 'vue';
import App from './App.vue'
import router from './router';
import lockScreenService from '@/service/lock-screen-service';

import('@asika32764/vue-animate/dist/vue-animate.css');

import { getPlatforms, IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/main.scss';

currentPlatforms.value = getPlatforms();

const app = createApp(App)
  .use(IonicVue, {
    mode: isElectron.value ? electronService.getMode() : undefined
  })
  .use(router);
  
router.isReady().then(async () => {
  await sodium.ready;
  await SecureStorage.setSynchronize(false);

  app.mount('#app');

  if (isLogin.value && !isLock.value) {
    lockScreenService.listenIdleTimeout();
  }

  // if (!isLogin.value) {
  //   router.replace('/auth/login');
  // } else if (lockAtStartup) {
  //   router.replace('/lock');
  // }
});
