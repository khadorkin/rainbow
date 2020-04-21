import { useCallback } from 'react';
import { useInitializeWallet, useClearAccountData } from '../hooks';
import { useDispatch } from 'react-redux';

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
