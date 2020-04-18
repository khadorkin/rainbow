import {
  loadUsersInfo,
  saveWalletDetails,
  loadCurrentUserInfo,
} from '../model/wallet';
import { logger } from '../utils';

const getMigrationVersion = async () => {
  return 0;
};

const setMigrationVersion = async () => {};

export default function useMigrations() {
  const migrate = async () => {
    // get current version
    const currentVersion = await getMigrationVersion();

    const migrations = [];

    // v1
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

    for (let i = currentVersion; i < migrations.length; i++) {
      logger.log(`Runing migration ${i}`);
      migrations[i].apply(null);
      logger.log(`Migration ${i} completed succesfully`);
      await setMigrationVersion(i);
    }
  };

  return migrate;
}
