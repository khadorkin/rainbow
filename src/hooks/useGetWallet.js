import { useSelector } from 'react-redux';

export default function useGetWallet() {
  const selected = useSelector(({ wallets: { selected } }) => selected);
  return selected;
}
