import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useClearAccountData, useInitializeWallet } from '../hooks';

export default function useSelectWallet() {
  const clearAccountData = useClearAccountData();
  const dispatch = useDispatch();
  const initializeWallet = useInitializeWallet();

  const selectWallet = useCallback(
    async wallet => {
      try {
        await clearAccountData();
        await dispatch(selectWallet(wallet));
        await initializeWallet();
      } catch (error) {
        return null;
      }
    },
    [clearAccountData, dispatch, initializeWallet]
  );

  return selectWallet;
}
