import { ACCESSIBLE } from 'react-native-keychain';
import {
  getMigrationVersion,
  setMigrationVersion,
} from '../handlers/localstorage/migrations';
import { loadAddress, saveAddress } from '../model/wallet';
import store from '../redux/store';

import { walletsSetSelected, walletsUpdate } from '../redux/wallets';
import { logger } from '../utils';

export default async function runMigrations() {
  // console.log('setting migration to 0');
  // await setMigrationVersion(0);
  // get current version
  const currentVersion = Number(await getMigrationVersion());
  const migrations = [];

  /***** Migration v0 starts here  *****/
  const v0 = async () => {
    const walletAddress = await loadAddress();
    const publicAccessControlOptions = {
      accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
    };
    if (walletAddress) {
      saveAddress(walletAddress, publicAccessControlOptions);
    }
  };

  migrations.push(v0);

  /***** Migration v0 ends here  *****/

  /***** Migration v1 starts here  *****/
  const v1 = async () => {
    const { selected } = store.getState().wallets;

    if (!selected) {
      // Read from the old wallet data
      const address = await loadAddress();
      if (address) {
        const id = `wallet_${new Date().getTime()}`;
        const currentWallet = {
          addresses: [
            {
              address,
              index: 0,
              label: '',
              visible: true,
            },
          ],
          color: 0,
          id,
          imported: false,
          name: 'My Wallet',
          type: 'normal',
        };

        const wallets = { [id]: currentWallet };

        store.dispatch(walletsUpdate(wallets));
        store.dispatch(walletsSetSelected(currentWallet));
      }
    }
  };

  migrations.push(v1);

  /***** Migration v1 ends here  *****/

  logger.log(
    'Migrations: ready to run migrations starting on number',
    currentVersion
  );
  if (migrations.length === currentVersion) {
    logger.log(`Migrations: Nothing to run`);
    return;
  }

  for (let i = currentVersion; i < migrations.length; i++) {
    logger.log(`Migrations: Runing migration ${i}`);
    migrations[i].apply(null);
    logger.log(`Migrations: Migration ${i} completed succesfully`);
    await setMigrationVersion(i + 1);
  }
}
