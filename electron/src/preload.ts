require('./rt/electron-rt');
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

export const ElectronApi = {
  canPromptTouchID(): Promise<boolean> {
    return ipcRenderer.invoke('can.prompt.touch.id');
  },

  promptTouchID(reason: string) {
    return ipcRenderer.invoke('prompt.touch.id', reason);
  },
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('isElectron', true);

contextBridge.exposeInMainWorld('electronApi', ElectronApi);

