import {
  generateAccount,
  getAllWallets,
  getSelectedWallet,
  saveAddress,
  saveAllWallets,
  setSelectedWallet,
} from '../model/wallet';

// -- Constants --------------------------------------- //
const WALLETS_UPDATE = 'wallets/ALL_WALLETS_UPDATE';
const WALLETS_LOAD = 'wallets/ALL_WALLETS_LOAD';
const WALLETS_SET_SELECTED = 'wallets/SET_SELECTED';

// -- Actions ---------------------------------------- //
export const walletsLoadState = () => async dispatch => {
  try {
    console.log('[redux-wallets] - walletsLoadState');
    const { wallets } = await getAllWallets();
    console.log('[redux-wallets] - wallets', wallets);
    const selected = await getSelectedWallet();
    console.log('[redux-wallets] - selected', selected);
    dispatch({
      payload: {
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
export const addressSetSelected = address => () => {
  saveAddress(address);
};

export const createAccountForWallet = id => async (dispatch, getState) => {
  console.log('creating account for wallet', id);
  const { wallets } = getState().wallets;
  console.log('wallets', wallets);
  let index = 0;
  wallets[id].addresses.forEach(
    account => (index = Math.max(index, account.index))
  );
  const newIndex = index + 1;
  console.log('new index is gonna be ', newIndex);
  const account = await generateAccount(id, newIndex);
  console.log('got account', newIndex);
  wallets[id].addresses.push({
    address: account.address,
    index: newIndex,
    label: '',
    visible: true,
  });
  console.log('saving all wallets', JSON.stringify(wallets, null, 2));
  saveAllWallets(wallets);
  dispatch({
    payload: wallets,
    type: WALLETS_UPDATE,
  });
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {
  selected: null,
  wallets: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLETS_SET_SELECTED:
      return { ...state, selected: action.payload };
    case WALLETS_UPDATE:
      return { ...state, wallets: action.payload };
    case WALLETS_LOAD:
      return {
        ...state,
        selected: action.payload.selected,
        wallets: action.payload.wallets,
      };
    default:
      return state;
  }
};
