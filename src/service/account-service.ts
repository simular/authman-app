import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { accountsStorage, mainStore } from '@/store/main-store';
import { Account, AccountContent } from '@/types';
import { base64UrlDecode, base64UrlEncode, uint82text } from '@/utilities/convert';
import { cloneDeep } from 'lodash-es';

export default new class {
  async create(account: Account, image: string) {
    const master = await encryptionService.getMasterKey();

    account = cloneDeep(account);

    if (!image) {
      throw new Error('No image');
    }

    const encryptedAccount = await this.encryptAccount(account, master);

    const res = await apiClient.post(
      'account/save',
      {
        item: encryptedAccount,
      },
    );
  }

  async loadAccounts() {
    const res = await apiClient.get<{
      data: {
        items: Account<string>[];
      }
    }>('account/list');
    
    accountsStorage.value = await res.data.data.items;
    mainStore.decryptedAccounts = await this.getDecryptedAccounts();
  }

  async encryptAccount(account: Account, key: Uint8Array | string) {
    const item = account as unknown as Account<string>;

    item.content = base64UrlEncode(
      await sodiumCipher.encrypt(
        JSON.stringify(account.content),
        key,
      ),
    );

    return item;
  }

  async decryptAccount(account: Account<string>, key: Uint8Array | string) {
    const item = cloneDeep(account) as unknown as Account;

    const content = await sodiumCipher.decrypt(base64UrlDecode(account.content), key);

    item.content = JSON.parse(uint82text(content)) as AccountContent;

    return item;
  }

  async fetchImage(url: string) {
    const res = await apiClient.get(url);

    return res.data;
  }

  async getDecryptedAccounts() {
    const accounts = accountsStorage.value;

    const items: Account[] = [];
    const master = await encryptionService.getMasterKey();

    for (const account of accounts) {
      const item = await this.decryptAccount(account, master);

      items.push(item);
    }

    return items;
  }
};
