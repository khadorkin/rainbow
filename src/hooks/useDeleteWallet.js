import { useCallback } from 'react';
import { useInitializeWallet, useClearAccountData } from '../hooks';

export default function useDeleteWallet() {
  const initializeWallet = useInitializeWallet();
  const clearAccountData = useClearAccountData();

  const deleteWallet = useCallback(
    async address => {
      try {
        // 1 - Delete the wallet
        await clearAccountData(address);
        // 2 - Select another wallet
        // Maybe first index from profile indexes
        // 3 - initialize the wallet
        await initializeWallet();

        return true;
      } catch (error) {
        return null;
      }
    },
    [clearAccountData, initializeWallet]
  );

  return deleteWallet;
}
