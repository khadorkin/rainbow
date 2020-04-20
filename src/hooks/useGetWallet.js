import { useCallback } from 'react';

export default function useGetWallet() {
  const getWallet = useCallback(() => {
    try {
        // TODO Get the current selected profile and return it
    } catch (error) {
      return null;
    }
  }, []);

  return getWallet;
}
