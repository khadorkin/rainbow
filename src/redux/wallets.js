import {
  getAllWallets,
  saveAllWallets,
  setSelectedWallet,
  getSelectedWallet,
  loadAddress,
  saveAddress,
} from '../model/wallet';

// -- Constants --------------------------------------- //
const WALLETS_UPDATE = 'wallets/ALL_WALLETS_UPDATE';
const WALLETS_LOAD = 'wallets/ALL_WALLETS_LOAD';
const WALLETS_SET_SELECTED = 'wallets/SET_SELECTED';
const WALLETS_SET_SELECTED_ADDRESS = 'wallets/SET_SELECTED_ADDRESS';

// -- Actions ---------------------------------------- //
export const walletsLoadState = () => async dispatch => {
  try {
    console.log('[redux-wallets] - walletsLoadState');
    const wallets = await getAllWallets();
    console.log('[redux-wallets] - wallets', wallets);
    const selected = await getSelectedWallet();
    console.log('[redux-wallets] - selected', selected);
    const address = await loadAddress();
    console.log('[redux-wallets] - address', address);
    dispatch({
      payload: {
        address,
        selected,
        wallets,
      },
      type: WALLETS_LOAD,
    });
    // eslint-disable-next-line no-empty
  } catch (error) {}
};

export const walletsUpdate = wallets => dispatch => {
  saveAllWallets(wallets);
  dispatch({
    payload: wallets,
    type: WALLETS_UPDATE,
  });
};

export const walletsSetSelected = wallet => dispatch => {
  setSelectedWallet(wallet);
  dispatch({
    payload: wallet,
    type: WALLETS_SET_SELECTED,
  });
};
export const addressSetSelected = address => dispatch => {
  saveAddress(address);
  dispatch({
    payload: address,
    type: WALLETS_SET_SELECTED_ADDRESS,
  });
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {
  address: null,
  selected: null,
  wallets: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLETS_SET_SELECTED_ADDRESS:
      return { ...state, address: action.payload };
    case WALLETS_SET_SELECTED:
      return { ...state, selected: action.payload };
    case WALLETS_UPDATE:
      return { ...state, wallets: action.payload };
    case WALLETS_LOAD:
      return {
        ...state,
        address: action.payload.address,
        selected: action.payload.selected,
        wallets: action.payload.wallets,
      };
    default:
      return state;
  }
};
