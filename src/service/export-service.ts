import accountService from '@/service/account-service';
import { isElectron, userStorage } from '@/store/main-store';
import { simpleAlert } from '@/utilities/alert';
import { useLoadingOverlay } from '@/utilities/loading';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default new class {
  async export() {
    const { run } = await useLoadingOverlay('Exporting...');

    const json = await run(async () => {
      return this.readAccountsToJson();
    });

    const fileName = 'authman-export.json';

    if (!Capacitor.isNativePlatform() || isElectron.value) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } else {
      const result = await Filesystem.writeFile({
        path: fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        data: json,
      });

      const canShare = await Share.canShare();

      if (canShare.value) {
        await Share.share({
          title: 'Save file to...',
          files: [result.uri],
        });
      } else {
        simpleAlert('Unable to share...');
      }

      // await FileOpener.openFile({
      //   path: result.uri,
      //   mimeType: 'application/json',
      // });
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
