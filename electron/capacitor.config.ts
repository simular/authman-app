import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.authman',
  appName: 'Authman',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
