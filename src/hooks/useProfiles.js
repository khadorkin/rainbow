import { useCallback } from 'react';
import { loadUsersInfo } from '../model/wallet';

export default async function useProfiles() {
  const getProfiles = useCallback(async () => {
    const p = await loadUsersInfo();
    return p;
  }, []);

  const profiles = getProfiles();
  return {
    profiles,
  };
}
