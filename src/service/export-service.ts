import accountService from '@/service/account-service';
import { userStorage } from '@/store/main-store';
import { useLoadingOverlay } from '@/utilities/loading';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';

export default new class {
  async export() {
    const { run } = await useLoadingOverlay('Exporting...');

    const json = await run(async () => {
      return this.readAccountsToJson();
    });

    const fileName = 'authman-export.json';

    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.writeFile({
        path: fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        data: json
      });

      await FileOpener.openFile({
        path: result.uri,
        mimeType: 'application/json',
      });
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    }
  }

  async readAccountsToJson() {
    const accounts = (await accountService.getAccounts())!;

    const items = await accountService.decryptAccounts(accounts);
    const user = userStorage.value!;
    let appInfo = undefined;

    try {
      appInfo = await App.getInfo();
    } catch (e) {
      //
    }

    const data = {
      app: 'Authman',
      userId: user.id,
      email: user.email,
      appId: appInfo?.name,
      version: appInfo?.version,
      build: appInfo?.build,
      accounts: items
    };
    return JSON.stringify(data);
  }
}
