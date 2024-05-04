import accountService from '@/service/account-service';
import localAuthService from '@/service/local-auth-service';
import { userStorage } from '@/store/main-store';
import { FileOpener } from '@capacitor-community/file-opener';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

export default new class {
  async export() {
    const kek = await localAuthService.auth();

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
      email: user.email,
      appId: appInfo?.name,
      version: appInfo?.version,
      build: appInfo?.build,
      accounts: items
    };
    const json = JSON.stringify(data);
    const fileName = 'authman-export.json';

    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.writeFile({
        path: fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        data: json
      });

      await FileOpener.open({
        filePath: result.uri,
        contentType: 'application/json',
      });
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    }

    // const canShare = await Share.canShare();
    //
    // if (!canShare.value) {
    //   await simpleAlert('Unable to save file');
    //   return;
    // }
    //
    //
  }
}

