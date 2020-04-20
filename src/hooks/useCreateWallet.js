import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useInitializeWallet } from '../hooks';
import { createWallet } from '../model/wallet';
import useSelectWallet from './useSelectWallet';

export default function useCreateWallet() {
  const initializeWallet = useInitializeWallet();
  const selectWallet = useSelectWallet();

  const createNewWallet = useCallback(async () => {
    try {
      // Create the new wallet
      const { address } = await createWallet();
      await selectWallet(address);
      // initialize the wallet
      return initializeWallet();
    } catch (error) {
      Alert.alert('Something went wrong during wallet creation process.');
      return null;
    }
  }, [initializeWallet, selectWallet]);

  return createNewWallet;
}
