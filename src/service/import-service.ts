import accountService from '@/service/account-service';
import { userStorage } from '@/store/main-store';
import { Account } from '@/types';
import { simpleAlert } from '@/utilities/alert';
import { useLoadingOverlay } from '@/utilities/loading';
import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';

export default new class {
  async import() {
    const fileResult = await this.chooseFile();
    const { run } = await useLoadingOverlay('Importing...');

    await run(async () => {
      await this.readFileAndSave(fileResult);
    });

    await simpleAlert('Import success.');
  }

  async readFileAndSave(fileResult: PickedFile) {
    const json = atob(fileResult.data || '');
    const data = JSON.parse(json);

    const accounts = data.accounts as Account[];
    const user = userStorage.value!;

    for (const account of accounts) {
      account.userId = user.id;
    }

    await accountService.saveMultiple(accounts);
    await accountService.loadAccounts();
  }

  async chooseFile() {
    const result = await FilePicker.pickFiles({
      types: ['application/json'],
      limit: 1,
      readData: true,
    });

    return result.files[0];
  }
};

