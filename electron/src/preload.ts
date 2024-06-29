import './rt/electron-rt';
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { platform } from 'os';

export const ElectronApi = {
  canPromptTouchID(): Promise<boolean> {
    return ipcRenderer.invoke('can.prompt.touch.id');
  },

  promptTouchID(reason: string) {
    return ipcRenderer.invoke('prompt.touch.id', reason);
  },

  storageSet(key: string, value: string): Promise<Buffer> {
    return ipcRenderer.invoke('storage.set', key, value);
  },

  storageGet(key: string): Promise<string> {
    return ipcRenderer.invoke('storage.get', key);
  },

  async storageRemove(key: string): Promise<void> {
    await ipcRenderer.invoke('storage.remove', key);
  },

  async share(shareItem: { title: string; url: string; }): Promise<void> {
    await ipcRenderer.invoke('share', shareItem);
  },
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: platform()
});
contextBridge.exposeInMainWorld('electronApi', ElectronApi);

