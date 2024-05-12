import { platform } from 'os';
import { ElectronApi } from '../../electron/src/preload';

declare global {
  interface Window {
    electron: {
      platform: ReturnType<platform>
    };
    electronApi: typeof ElectronApi;
  }
}
