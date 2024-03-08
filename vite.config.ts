import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import showEnv from '@asika32764/vite-plugin-show-env';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ mode}) => {
  return {
    plugins: [
      vue(),
      legacy(),
      showEnv([
        'VITE_API_ENDPOINT',
        'VITE_TEST_USERNAME',
        'VITE_TEST_PASSWORD'
      ]),
      mode === 'production'
        ? undefined
        : checker({
          vueTsc: {
            tsconfigPath: 'tsconfig.json'
          },
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
