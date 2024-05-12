import { isElectron } from '@/store/main-store';

export default new class {
  getMode() {
    if (this.isMac()) {
      return 'ios';
    }

    return 'md';
  }

  isWindows() {
    return this.getPlatform() === 'win32';
  }

  isMac() {
    return this.getPlatform() === 'darwin';
  }

  isLinux() {
    return this.getPlatform() === 'linux';
  }

  getPlatform() {
    if (!isElectron.value) {
      return '';
    }

    return window.electron.platform;
  }
}

