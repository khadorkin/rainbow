import { captureException } from '@sentry/react-native';
import { isNil } from 'lodash';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { getAccountInfo } from '../handlers/localstorage/accountLocal';
import runMigrations from '../model/migrations';
import { walletInit } from '../model/wallet';
import { setIsWalletEthZero } from '../redux/isWalletEthZero';
import {
  settingsLoadNetwork,
  settingsUpdateAccountAddress,
  settingsUpdateAccountColor,
  settingsUpdateAccountName,
} from '../redux/settings';
import { walletsLoadState } from '../redux/wallets';
import { logger } from '../utils';
import useAccountSettings from './useAccountSettings';
import useCheckEthBalance from './useCheckEthBalance';
import useClearAccountData from './useClearAccountData';
import useHideSplashScreen from './useHideSplashScreen';
import useInitializeAccountData from './useInitializeAccountData';
import useLoadAccountData from './useLoadAccountData';

export default function useInitializeWallet() {
  const dispatch = useDispatch();
  const onHideSplashScreen = useHideSplashScreen();
  const clearAccountData = useClearAccountData();
  const loadAccountData = useLoadAccountData();
  const initializeAccountData = useInitializeAccountData();

  const checkEthBalance = useCheckEthBalance();

  const { network } = useAccountSettings();

  const initializeWallet = useCallback(
    async (seedPhrase, color = null, name = null) => {
      try {
        console.log(
          '[IMPORT-WALLET]: initializing wallet with ',
          seedPhrase,
          color,
          name
        );
        logger.sentry('Start wallet setup');
        if (!seedPhrase) {
          await dispatch(walletsLoadState());
          await runMigrations();
        }
        // Load the network first
        await dispatch(settingsLoadNetwork());
        console.log('[IMPORT-WALLET]: calling walletInit ');
        const { isImported, isNew, walletAddress } = await walletInit(
          seedPhrase,
          color,
          name
        );
        if (seedPhrase) {
          await dispatch(walletsLoadState());
        }
        const info = await getAccountInfo(walletAddress, network);
        if (info.name && info.color) {
          dispatch(settingsUpdateAccountName(info.name));
          dispatch(settingsUpdateAccountColor(info.color));
        }
        if (isNil(walletAddress)) {
          Alert.alert(
            'Import failed due to an invalid private key. Please try again.'
          );
          return null;
        }
        if (isImported) {
          await clearAccountData();
        }
        dispatch(settingsUpdateAccountAddress(walletAddress));
        if (isNew) {
          dispatch(setIsWalletEthZero(true));
        } else if (isImported) {
          try {
            await checkEthBalance(walletAddress);
            // eslint-disable-next-line no-empty
          } catch (error) {}
        } else {
          await loadAccountData();
        }
        onHideSplashScreen();
        logger.log('Hide splash screen');
        initializeAccountData();
        return walletAddress;
      } catch (error) {
        console.log(error);
        // TODO specify error states more granular
        onHideSplashScreen();
        captureException(error);
        Alert.alert('Something went wrong while importing. Please try again!');
        return null;
      }
    },
    [
      checkEthBalance,
      clearAccountData,
      dispatch,
      initializeAccountData,
      loadAccountData,
      network,
      onHideSplashScreen,
    ]
  );

  return initializeWallet;
}
