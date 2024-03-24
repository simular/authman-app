import { StorageSerializers, useLocalStorage } from '@vueuse/core';

export const enableBiometricsOption = useLocalStorage(
  '@authman:config:enable.biometrics',
  false,
  {
    serializer: StorageSerializers.boolean
  }
);
