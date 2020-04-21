import { useSelector } from 'react-redux';

export default function useAddress() {
  const address = useSelector(({ wallets: { address } }) => address);
  return address;
}
