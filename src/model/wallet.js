import { captureException } from '@sentry/react-native';
import { signTypedData_v4, signTypedDataLegacy } from 'eth-sig-util';
import { toBuffer } from 'ethereumjs-util';
import { ethers } from 'ethers';
import lang from 'i18n-js';
import { get, isEmpty, isNil } from 'lodash';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
  canImplyAuthentication,
} from 'react-native-keychain';
import { isMultiwalletAvailable } from '../config/experimental';
import {
  addHexPrefix,
  isHexString,
  isHexStringIgnorePrefix,
  isValidMnemonic,
  web3Provider,
} from '../handlers/web3';
import * as keychain from './keychain';

const seedPhraseKey = 'rainbowSeedPhrase';
const privateKeyKey = 'rainbowPrivateKey';
const addressKey = 'rainbowAddressKey';
const selectedWalletKey = 'rainbowSelectedWalletKey';
const allWalletsKey = 'rainbowAllWalletsKey';
const seedPhraseMigratedKey = 'rainbowSeedPhraseMigratedKey';

const privateKeyVersion = 1.0;
const seedPhraseVersion = 1.0;
const selectedWalletVersion = 1.0;
const allWalletsVersion = 1.0;

export function generateSeedPhrase() {
  return ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
}

export const walletInit = async (seedPhrase = null) => {
  let walletAddress = null;
  let isImported = false;
  let isNew = false;
  // Importing a seedphrase
  if (!isEmpty(seedPhrase)) {
    let wallet;
    if (isMultiwalletAvailable) {
      wallet = await newCreateWallet(seedPhrase);
    } else {
      wallet = await createWallet(seedPhrase);
    }
    walletAddress = wallet.address;
    isImported = !isNil(walletAddress);
    return { isImported, isNew, walletAddress };
  }
  walletAddress = await loadAddress();
  // First launch (no seed phrase)
  if (!walletAddress) {
    let wallet;
    if (isMultiwalletAvailable) {
      wallet = await newCreateWallet();
    } else {
      wallet = await createWallet();
    }
    walletAddress = wallet.address;
    isNew = true;
  }
  return { isImported, isNew, walletAddress };
};

export const loadWallet = async () => {
  const privateKey = await loadPrivateKey();
  if (privateKey) {
    return new ethers.Wallet(privateKey, web3Provider);
  }
  return null;
};

export const getChainId = async () => {
  const wallet = await loadWallet();
  return get(wallet, 'provider.chainId');
};

export const createTransaction = async (
  to,
  data,
  value,
  gasLimit,
  gasPrice,
  nonce = null
) => ({
  data,
  gasLimit,
  gasPrice,
  nonce,
  to,
  value: ethers.utils.parseEther(value),
});

export const sendTransaction = async ({ transaction }) => {
  try {
    const wallet = await loadWallet();
    if (!wallet) return null;
    try {
      const result = await wallet.sendTransaction(transaction);
      return result.hash;
    } catch (error) {
      Alert.alert(lang.t('wallet.transaction.alert.failed_transaction'));
      captureException(error);
      return null;
    }
  } catch (error) {
    Alert.alert(lang.t('wallet.transaction.alert.authentication'));
    captureException(error);
    return null;
  }
};

export const signTransaction = async ({ transaction }) => {
  try {
    const wallet = await loadWallet();
    if (!wallet) return null;
    try {
      return wallet.sign(transaction);
    } catch (error) {
      Alert.alert(lang.t('wallet.transaction.alert.failed_transaction'));
      captureException(error);
      return null;
    }
  } catch (error) {
    Alert.alert(lang.t('wallet.transaction.alert.authentication'));
    captureException(error);
    return null;
  }
};

export const signMessage = async (
  message,
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    const wallet = await loadWallet(authenticationPrompt);
    try {
      const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
      const sigParams = await signingKey.signDigest(
        ethers.utils.arrayify(message)
      );
      return ethers.utils.joinSignature(sigParams);
    } catch (error) {
      captureException(error);
      return null;
    }
  } catch (error) {
    Alert.alert(lang.t('wallet.transaction.alert.authentication'));
    captureException(error);
    return null;
  }
};

export const signPersonalMessage = async (
  message,
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    const wallet = await loadWallet(authenticationPrompt);
    try {
      return wallet.signMessage(
        isHexString(message) ? ethers.utils.arrayify(message) : message
      );
    } catch (error) {
      captureException(error);
      return null;
    }
  } catch (error) {
    Alert.alert(lang.t('wallet.transaction.alert.authentication'));
    captureException(error);
    return null;
  }
};

export const signTypedDataMessage = async (
  message,
  method,
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    const wallet = await loadWallet(authenticationPrompt);

    try {
      const pkeyBuffer = toBuffer(addHexPrefix(wallet.privateKey));
      let parsedData = message;
      try {
        parsedData = JSON.parse(message);
        // eslint-disable-next-line no-empty
      } catch (e) {}

      // There are 3 types of messages
      // v1 => basic data types
      // v3 =>  has type / domain / primaryType
      // v4 => same as v3 but also supports which supports arrays and recursive structs.
      // Because v4 is backwards compatible with v3, we're supporting only v4

      let version = 'v1';
      if (parsedData.types || parsedData.primaryType || parsedData.domain) {
        version = 'v4';
      }

      switch (version) {
        case 'v4':
          return signTypedData_v4(pkeyBuffer, {
            data: parsedData,
          });
        default:
          return signTypedDataLegacy(pkeyBuffer, { data: parsedData });
      }
    } catch (error) {
      captureException(error);
      return null;
    }
  } catch (error) {
    Alert.alert(lang.t('wallet.transaction.alert.authentication'));
    captureException(error);
    return null;
  }
};

export const loadSeedPhrase = async (
  authenticationPrompt = lang.t('wallet.authenticate.please_seed_phrase')
) => {
  const seedPhrase = await keychain.loadString(seedPhraseKey, {
    authenticationPrompt,
  });
  return seedPhrase;
};

export const loadAddress = async () => {
  try {
    return keychain.loadString(addressKey);
  } catch (error) {
    captureException(error);
    return null;
  }
};

const createWallet = async seed => {
  const walletSeed = seed || generateSeedPhrase();
  let wallet = null;
  try {
    if (
      isHexStringIgnorePrefix(walletSeed) &&
      addHexPrefix(walletSeed).length === 66
    ) {
      wallet = new ethers.Wallet(walletSeed);
    } else if (isValidMnemonic(walletSeed)) {
      wallet = ethers.Wallet.fromMnemonic(walletSeed);
    } else {
      let hdnode = ethers.utils.HDNode.fromSeed(walletSeed);
      let node = hdnode.derivePath("m/44'/60'/0'/0/0");
      wallet = new ethers.Wallet(node.privateKey);
    }
    if (wallet) {
      saveWalletDetails(walletSeed, wallet.privateKey, wallet.address);
      return wallet;
    }
    return null;
  } catch (error) {
    captureException(error);
    return null;
  }
};

const saveWalletDetails = async (seedPhrase, privateKey, address) => {
  const canAuthenticate = await canImplyAuthentication({
    authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  });

  let isSimulator = false;

  if (canAuthenticate) {
    isSimulator = __DEV__ && (await DeviceInfo.isEmulator());
  }

  let privateAccessControlOptions = {};
  if (canAuthenticate && !isSimulator) {
    privateAccessControlOptions = {
      accessControl: ACCESS_CONTROL.USER_PRESENCE,
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
  }

  const publicAccessControlOptions = {
    accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
  };

  saveSeedPhrase(seedPhrase, privateAccessControlOptions);
  savePrivateKey(privateKey, privateAccessControlOptions);
  saveAddress(address, publicAccessControlOptions);
};

const saveSeedPhrase = async (seedPhrase, accessControlOptions = {}) => {
  await keychain.saveString(seedPhraseKey, seedPhrase, accessControlOptions);
};

const savePrivateKey = async (privateKey, accessControlOptions = {}) => {
  await keychain.saveString(privateKeyKey, privateKey, accessControlOptions);
};

const loadPrivateKey = async (
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    return keychain.loadString(privateKeyKey, {
      authenticationPrompt,
    });
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const saveAddress = async (address, accessControlOptions = {}) => {
  await keychain.saveString(addressKey, address, accessControlOptions);
};

export const newCreateWallet = async seed => {
  console.log('[IMPORT-WALLET]: newCreateWallet', seed);
  const walletSeed = seed || generateSeedPhrase();
  let wallet = null;
  let hdnode = null;
  let type = null;
  let addresses = [];
  try {
    // Private key
    if (
      isHexStringIgnorePrefix(walletSeed) &&
      addHexPrefix(walletSeed).length === 66
    ) {
      type = 'private_key';
      wallet = new ethers.Wallet(walletSeed);
      console.log('[IMPORT-WALLET]: private key type', { wallet });
      // 12 or 24 words seed phrase
    } else if (isValidMnemonic(walletSeed)) {
      type = 'mnemonic';
      hdnode = ethers.utils.HDNode.fromMnemonic(walletSeed);
    } else {
      // seed
      type = 'seed';
      hdnode = ethers.utils.HDNode.fromSeed(walletSeed);
    }

    // Always generate the first account
    if (!wallet) {
      const node = hdnode.derivePath(`m/44'/60'/0'/0/0`);
      wallet = new ethers.Wallet(node.privateKey);
      console.log(`[IMPORT-WALLET]: ${type} type`, { wallet });
    }
    const id = `wallet_${new Date().getTime()}`;
    const publicAccessControlOptions = {
      accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
    };
    console.log('[IMPORT-WALLET]: saving pkey');
    // Save private key
    await newSavePrivateKey(wallet.address, wallet.privateKey);
    console.log('[IMPORT-WALLET]: saving seed');
    // Save seed
    await newSaveSeedPhrase(walletSeed, id);
    console.log('[IMPORT-WALLET]: saving migration flag');
    // Save migration flag
    await keychain.saveString(
      seedPhraseMigratedKey,
      'true',
      publicAccessControlOptions
    );

    console.log('[IMPORT-WALLET]: adding address to list');

    addresses.push({
      address: wallet.address,
      index: 0,
      label: '',
      visible: true,
    });

    if (hdnode) {
      let index = 1;
      let lookup = true;
      console.log('[IMPORT-WALLET]: looking up other addresses');

      while (lookup) {
        const node = hdnode.derivePath(`m/44'/60'/0'/0/${index}`);
        const nextWallet = new ethers.Wallet(node.privateKey);
        // TODO: Hit etherscan for this and check tx history
        const hasTxHistory = false;
        if (hasTxHistory) {
          index++;
          // Save private key
          await newSavePrivateKey(nextWallet.address, nextWallet.privateKey);
          addresses.push({
            address: nextWallet.address,
            index,
            label: '',
            visible: true,
          });
          console.log('[IMPORT-WALLET]: found new index with history', index);
        } else {
          console.log('[IMPORT-WALLET]: nothing found');
          lookup = false;
        }
      }
    }

    console.log('[IMPORT-WALLET]: getting allWallets');
    const { wallets: allWallets } = getAllWallets();
    console.log('[IMPORT-WALLET]: got allWallets');

    allWallets[id] = {
      addresses,
      color: 0,
      id,
      imported: seed ? true : false,
      name: `${seed ? 'Imported' : 'My'} Wallet`,
      type,
    };

    console.log('[IMPORT-WALLET]: added to allwallets', allWallets[id]);

    await saveAllWallets(allWallets);

    console.log('[IMPORT-WALLET]: saved allwallets');

    if (wallet) {
      return wallet;
    }
    return null;
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const newSavePrivateKey = async (address, privateKey) => {
  let privateAccessControlOptions = {};
  const canAuthenticate = await canImplyAuthentication({
    authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  });

  let isSimulator = false;

  if (canAuthenticate) {
    isSimulator = __DEV__ && (await DeviceInfo.isEmulator());
  }
  if (canAuthenticate && !isSimulator) {
    privateAccessControlOptions = {
      accessControl: ACCESS_CONTROL.USER_PRESENCE,
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
  }

  const key = `${address}_${privateKeyKey}`;
  const val = {
    address,
    privateKey,
    version: privateKeyVersion,
  };

  await keychain.saveObject(key, val, privateAccessControlOptions);
};

export const newGetPrivateKey = async (
  address,
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    const key = `${address}_${privateKeyKey}`;
    return keychain.loadObject(key, {
      authenticationPrompt,
    });
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const newSaveSeedPhrase = async (seedphrase, keychain_id = null) => {
  let privateAccessControlOptions = {};
  const canAuthenticate = await canImplyAuthentication({
    authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  });

  let isSimulator = false;

  if (canAuthenticate) {
    isSimulator = __DEV__ && (await DeviceInfo.isEmulator());
  }
  if (canAuthenticate && !isSimulator) {
    privateAccessControlOptions = {
      accessControl: ACCESS_CONTROL.USER_PRESENCE,
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
  }

  const id = keychain_id || `wallet_${new Date().getTime()}`;

  const key = `${id}_${seedPhraseKey}`;
  const val = {
    id,
    seedphrase,
    version: seedPhraseVersion,
  };

  await keychain.saveObject(key, val, privateAccessControlOptions);
};

export const newGetSeedPhrase = async (
  id,
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    const key = `${id}_${seedPhraseKey}`;
    return keychain.loadObject(key, {
      authenticationPrompt,
    });
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const setSelectedWallet = async wallet => {
  const publicAccessControlOptions = {
    accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
  };

  const val = {
    version: selectedWalletVersion,
    wallet,
  };

  await keychain.saveObject(selectedWalletKey, val, publicAccessControlOptions);
};

export const getSelectedWallet = async (
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    return keychain.loadObject(selectedWalletKey, {
      authenticationPrompt,
    });
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const saveAllWallets = async wallets => {
  const publicAccessControlOptions = {
    accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
  };

  const val = {
    version: allWalletsVersion,
    wallets,
  };

  await keychain.saveObject(allWalletsKey, val, publicAccessControlOptions);
};

export const getAllWallets = async (
  authenticationPrompt = lang.t('wallet.authenticate.please')
) => {
  try {
    return keychain.loadObject(allWalletsKey, {
      authenticationPrompt,
    });
  } catch (error) {
    captureException(error);
    return null;
  }
};

export const generateAccount = async (id, index) => {
  try {
    const authenticationPrompt = lang.t('wallet.authenticate.please');
    const isSeedPhraseMigrated = await keychain.loadString(
      seedPhraseMigratedKey,
      {
        authenticationPrompt,
      }
    );
    let seedPhrase;
    // We need to migrate the seedphrase & private key first
    if (!isSeedPhraseMigrated) {
      const publicAccessControlOptions = {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      };
      seedPhrase = await loadSeedPhrase();
      console.log('got seedphrase', seedPhrase);
      // Regenerate the existing private key to store it with the new format
      const hdnode = ethers.utils.HDNode.fromMnemonic(seedPhrase);
      console.log('got hdnode', hdnode);
      const node = hdnode.derivePath(`m/44'/60'/0'/0/0`);
      console.log('got node', node);
      const existingAccount = new ethers.Wallet(node.privateKey);
      console.log('got existing account regenerated', existingAccount);
      await newSavePrivateKey(
        existingAccount.address,
        existingAccount.privateKey
      );
      await newSaveSeedPhrase(seedPhrase, id);
      await keychain.saveString(
        seedPhraseMigratedKey,
        'true',
        publicAccessControlOptions
      );
    } else {
      const seedData = await newGetSeedPhrase(id);
      seedPhrase = seedData.seedphrase;
      console.log('got seedPhrase', seedPhrase);
    }

    if (!seedPhrase) {
      throw new Error(`Can't access seed phrase to create new accounts`);
    }

    const hdnode = ethers.utils.HDNode.fromMnemonic(seedPhrase);
    const node = hdnode.derivePath(`m/44'/60'/0'/0/${index}`);
    console.log('got node', node);
    const account = new ethers.Wallet(node.privateKey);
    console.log('got account', node);
    await newSavePrivateKey(account.address, account.privateKey);
    console.log('gucci');
    return account;
  } catch (error) {
    console.log('Error generating account for keychain', id, error);
  }
};
