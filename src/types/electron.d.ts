import { ElectronApi } from '../../electron/src/preload';

declare global {
  interface Window {
    electronApi: typeof ElectronApi
  }
}
