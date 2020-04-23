import { useSelector } from 'react-redux';

export default function useWallets() {
  const wallets = useSelector(({ wallets }) => wallets);
  //console.log("REDUX SHIT", JSON.stringify(wallets, null, 2));
  return wallets;
}
