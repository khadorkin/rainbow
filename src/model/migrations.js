import {
  getMigrationVersion,
  setMigrationVersion,
} from '../handlers/localstorage/migrations';

import {
  loadUsersInfo,
  saveWalletDetails,
  loadCurrentUserInfo,
} from '../model/wallet';

import { logger } from '../utils';

export default async function runMigrations() {
  // get current version
  const currentVersion = Number(await getMigrationVersion());
  const migrations = [];

  /***** Migration v0 ends here  *****/
  const v1 = async () => {
    let profiles = await loadUsersInfo();
    if (!profiles || profiles.length === 0) {
      const wallet = await loadCurrentUserInfo();
      const currentWallet = {
        address: wallet.address,
        color: 0,
        name: 'My Wallet',
        privateKey: wallet.privateKey,
        seedPhrase: wallet.seedPhrase,
      };

      await saveWalletDetails(
        currentWallet.name,
        currentWallet.color,
        currentWallet.seedPhrase,
        currentWallet.privateKey,
        currentWallet.address
      );
      profiles = [currentWallet];
    }
  };

  migrations.push(v1);

  /***** Migration v0 ends here  *****/

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
