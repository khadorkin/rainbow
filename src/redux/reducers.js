import { combineReducers } from 'redux';

import actionSheetManager from './actionSheetManager';
import addCash from './addCash';
import contacts from './contacts';
import data from './data';
import editOptions from './editOptions';
import explorer from './explorer';
import gas from './gas';
import imageDimensionsCache from './imageDimensionsCache';
import isWalletEmpty from './isWalletEmpty';
import isWalletEthZero from './isWalletEthZero';
import isWalletImporting from './isWalletImporting';
import keyboardHeight from './keyboardHeight';
import navigation from './navigation';
import nonce from './nonce';
import openStateSettings from './openStateSettings';
import raps from './raps';
import requests from './requests';
import savings from './savings';
import selectedInput from './selectedInput';
import selectedWithFab from './selectedWithFab';
import settings from './settings';
import showcaseTokens from './showcaseTokens';
import uniqueTokens from './uniqueTokens';
import uniswap from './uniswap';
import walletconnect from './walletconnect';
import wallets from './wallets';

export default combineReducers({
  actionSheetManager,
  addCash,
  contacts,
  data,
  editOptions,
  explorer,
  gas,
  imageDimensionsCache,
  isWalletEmpty,
  isWalletEthZero,
  isWalletImporting,
  keyboardHeight,
  navigation,
  nonce,
  openStateSettings,
  raps,
  requests,
  savings,
  selectedInput,
  selectedWithFab,
  settings,
  showcaseTokens,
  uniqueTokens,
  uniswap,
  walletconnect,
  wallets,
});
