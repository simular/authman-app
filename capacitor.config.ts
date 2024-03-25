import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uniauth.authman',
  appName: 'authman-app',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
