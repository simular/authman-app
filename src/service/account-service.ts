import apiClient from '@/service/api-client';
import { sodiumCipher } from '@/service/cipher';
import encryptionService from '@/service/encryption-service';
import { accountsStorage } from '@/store/main-store';
import { Account, AccountContent } from '@/types';
import { base64UrlDecode, base64UrlEncode, uint82text } from '@/utilities/convert';
import { cloneDeep } from 'lodash-es';

export default new class {
  async create(account: Account, image: string) {
    const master = await encryptionService.getMasterKey();

    account = cloneDeep(account);
    let encImage = '';

    if (image) {
      encImage = base64UrlEncode(
        await sodiumCipher.encrypt(
          image,
          master,
        )
      );
    }

    const encryptedAccount = await this.encryptAccount(account, master);

    const res = await apiClient.post(
      'account/save',
      {
        item: encryptedAccount,
        image: encImage,
      },
    );
  }

  async loadAccounts() {
    const res = await apiClient.get<{
      data: {
        items: Account<string>[];
      }
    }>('account/list');
    
    accountsStorage.value = await this.prepareAccounts(res.data.data.items);
  }

  async prepareAccounts(items: Account<string>[]) {
    const promises = [];

    for (const item of items) {

      promises.push(
        this.fetchImage(item.image)
          .then((img) => {
            item.image = img;
          })
      );
    }

    await Promise.all(promises);

    return items;
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

    if (!item.image.startsWith('data:image')) {
      item.image = uint82text(
        await sodiumCipher.decrypt(base64UrlDecode(item.image), key)
      );
    }

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
