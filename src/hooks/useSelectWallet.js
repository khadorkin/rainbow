import { useCallback } from 'react';
import { useInitializeWallet, useClearAccountData } from '../hooks';

export default function useSelectWallet() {
  const clearAccountData = useClearAccountData();

  const selectWallet = useCallback(
    async profile => {
      try {
          await clearAccountData();
          // TODO
          
      } catch (error) {
        return null;
      }
    },
    [clearAccountData]
  );

  return selectWallet;
}
