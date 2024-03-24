import { StorageSerializers, useLocalStorage } from '@vueuse/core';

export const enableBiometricsOption = useLocalStorage(
  '@authman:config:enable.biometrics',
  true,
  {
    serializer: StorageSerializers.boolean
  }
);
