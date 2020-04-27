import { filter, slice, toLower } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiGetTopMovers } from '../handlers/topMovers';

const hasLiquidity = (movers, allPairs) => {
  const filtered = filter(movers, mover => {
    const key = toLower(mover.address);
    const assetOnUniswap = allPairs[key];
    return assetOnUniswap && assetOnUniswap.ethBalance > 0;
  });
  return slice(filtered, 0, 5);
};

export default function useTopMovers() {
  const [movers, setMovers] = useState({});

  const { allPairs } = useSelector(({ uniswap: { allPairs } }) => ({
    allPairs,
  }));

  const updateTopMovers = useCallback(async () => {
    const { gainers, losers } = await apiGetTopMovers();
    const gainersOnUniswap = hasLiquidity(gainers, allPairs);
    const losersOnUniswap = hasLiquidity(losers, allPairs);
    setMovers({ gainers: gainersOnUniswap, losers: losersOnUniswap });
  }, [allPairs]);

  useEffect(() => {
    updateTopMovers();
  }, [updateTopMovers]);

  return movers;
}
