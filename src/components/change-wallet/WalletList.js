import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { compose } from 'recompact';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'recyclerlistview';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import { deviceUtils } from '../../utils';
import WalletDivider from './WalletDivider';
import WalletOption from './WalletOption';
import WalletRow from './WalletRow';

const rowHeight = 50;
const lastRowPadding = 10;

let position = 0;

const WALLET_ROW = 1;
const WALLET_LAST_ROW = 2;

const sx = StyleSheet.create({
  container: {
    paddingTop: 2,
  },
});

class WalletList extends React.Component {
  static propTypes = {
    accountAddress: PropTypes.string,
    allWallets: PropTypes.array,
    currentWallet: PropTypes.object,
    height: PropTypes.number,
    navigation: PropTypes.object,
    onChangeWallet: PropTypes.func,
    onCloseEditWalletModal: PropTypes.func,
    onDeleteWallet: PropTypes.func,
    onPressImportSeedPhrase: PropTypes.func,
  };

  constructor(args) {
    super(args);

    this.state = {
      wallets: [],
    };

    this._layoutProvider = new LayoutProvider(
      i => {
        if (this.props.allWallets && i < this.props.allWallets.length) {
          return WALLET_ROW;
        }
        return WALLET_LAST_ROW;
      },
      (type, dim) => {
        if (type === WALLET_ROW) {
          dim.width = deviceUtils.dimensions.width;
          dim.height = rowHeight;
        } else if (type === WALLET_LAST_ROW) {
          dim.width = deviceUtils.dimensions.width;
          dim.height = rowHeight + lastRowPadding;
        } else {
          dim.width = 0;
          dim.height = 0;
        }
      }
    );
    this._renderRow = this._renderRow.bind(this);
    this.currentlyOpenWallet = undefined;
    this.touchedContact = undefined;
    this.recentlyRendered = false;
  }

  componentWillReceiveProps = props => {
    const newItems = Object.assign([], props.allWallets || []);
    for (let i = 0; i < newItems.length; i++) {
      if (this.props.accountAddress === newItems[i].address.toLowerCase()) {
        newItems.splice(i, 1);
        break;
      }
    }

    newItems.push({
      icon: 'arrowBack',
      isOption: true,
      label: 'Import a Wallet',
      onPress: this.props.onPressImportSeedPhrase,
    });

    if (newItems !== this.state.wallets) {
      this.setState({ wallets: newItems });
    }
  };

  shouldComponentUpdate = () => {
    if (position < 0) {
      return false;
    }
    return true;
  };

  closeAllDifferentContacts = address => {
    this.lastTouchedContact = this.touchedContact;
    this.touchedContact = address;
    this.recentlyRendered = false;
    this.setState({ touchedContact: address });
  };

  renderItem = item =>
    item.isOption ? (
      <WalletOption
        icon={item.icon}
        label={item.label}
        onPress={item.onPress}
      />
    ) : (
      <WalletRow
        key={item.address}
        accountName={item.name}
        accountColor={item.color}
        accountAddress={item.address}
        onPress={() => this.props.onChangeWallet(item)}
        onEditWallet={() =>
          this.props.navigation.navigate('ExpandedAssetScreen', {
            address: item.address,
            asset: [],
            isCurrentWallet: false,
            item,
            onCloseModal: editedWallet => {
              this.props.onCloseEditWalletModal(editedWallet);
              this.props.onDeleteWallet(editedWallet.address);
            },
            type: 'profile_creator',
          })
        }
        onTouch={this.closeAllDifferentContacts}
        onTransitionEnd={this.changeCurrentlyUsedContact}
        currentlyOpenWallet={this.touchedContact}
      />
    );

  _renderRow(type, data) {
    return this.renderItem(data);
  }

  filterContactList = (
    list,
    searchPhrase,
    searchParameter = false,
    separator = ' '
  ) => {
    const filteredList = [];
    if (list && searchPhrase.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const searchedItem = searchParameter
          ? list[i][searchParameter]
          : list[i];
        const splitedWordList = searchedItem.split(separator);
        splitedWordList.push(searchedItem);
        splitedWordList.push(removeFirstEmojiFromString(searchedItem).join(''));
        for (let j = 0; j < splitedWordList.length; j++) {
          if (
            splitedWordList[j]
              .toLowerCase()
              .startsWith(searchPhrase.toLowerCase())
          ) {
            filteredList.push(list[i]);
            break;
          }
        }
      }
    } else {
      return list;
    }
    return filteredList;
  };

  changeCurrentlyUsedContact = address => {
    this.currentlyOpenWallet = address;
  };

  render() {
    const {
      accountAddress,
      currentWallet,
      height,
      navigation,
      onCloseEditWalletModal,
    } = this.props;
    return (
      <View style={sx.container}>
        {currentWallet && (
          <WalletRow
            accountName={currentWallet.name}
            accountColor={currentWallet.color}
            addresses={currentWallet.addresses}
            selectedAddress={accountAddress}
            isHeader
            onPress={() => navigation.goBack()}
            onEditWallet={() =>
              navigation.navigate('ExpandedAssetScreen', {
                address: currentWallet.address,
                asset: [],
                isCurrentWallet: true,
                onCloseModal: editedWallet =>
                  onCloseEditWalletModal(editedWallet),
                profile: currentWallet,
                type: 'profile_creator',
              })
            }
            onTouch={this.closeAllDifferentContacts}
            onTransitionEnd={this.changeCurrentlyUsedContact}
            isInitializationOver
          />
        )}
        <WalletDivider />
        <View style={{ height }}>
          <RecyclerListView
            rowRenderer={this._renderRow}
            dataProvider={new DataProvider((r1, r2) => {
              if (this.isInitalized) {
                if (r2 === this.state.wallets[this.state.wallets.length - 2]) {
                  this.isInitalized = false;
                }
                return true;
              }
              if (
                this.touchedContact !== r2.address &&
                this.lastTouchedContact === r2.address &&
                this.currentlyOpenWallet &&
                this.touchedContact !== this.currentlyOpenWallet &&
                !this.recentlyRendered
              ) {
                if (r2 === this.state.wallets[this.state.wallets.length - 2]) {
                  this.recentlyRendered = true;
                }
                return true;
              }
              if (r1 !== r2) {
                return true;
              }
              return false;
            }).cloneWithRows(this.state.wallets)}
            layoutProvider={this._layoutProvider}
            onScroll={(event, _offsetX, offsetY) => {
              position = offsetY;
            }}
            optimizeForInsertDeleteAnimations
          />
        </View>
      </View>
    );
  }
}

export default compose(withNavigation)(WalletList);
