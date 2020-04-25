import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'recyclerlistview';
import { deviceUtils } from '../../utils';
import AddressOption from './AddressOption';
import AddressRow from './AddressRow';
import WalletDivider from './WalletDivider';
import WalletOption from './WalletOption';
import WalletRow from './WalletRow';

const rowHeight = 50;
const lastRowPadding = 10;

const RowTypes = {
  ADDRESS: 0,
  ADDRESS_OPTION: 1,
  WALLET: 2,
  WALLET_OPTION: 3,
  // eslint-disable-next-line sort-keys
  LAST_ROW: 4,
};

const sx = StyleSheet.create({
  container: {
    paddingTop: 2,
  },
});

export function WalletList({
  accountAddress,
  allWallets,
  currentWallet,
  height,
  onPressAddAccount,
  onPressImportSeedPhrase,
  onChangeAccount,
}) {
  const { goBack } = useNavigation();
  const [rows, setRows] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [dataProvider, setDataProvider] = useState(null);
  const [layoutProvider, setLayoutProvider] = useState(null);

  // Update the rows when the allWallets changes
  useEffect(() => {
    let rows = [];
    if (!allWallets) return;
    Object.keys(allWallets).forEach(key => {
      const wallet = allWallets[key];
      rows.push({ ...wallet, rowType: RowTypes.WALLET });
      wallet.addresses.forEach(account => {
        rows.push({
          ...account,
          id: account.address,
          onPress: () => onChangeAccount(wallet.id, account.address),
          rowType: RowTypes.ADDRESS,
          wallet_id: wallet.id,
        });
      });
      rows.push({
        icon: 'plus',
        id: 'add_account',
        label: 'Add account',
        onPress: () => onPressAddAccount(wallet.id),
        rowType: RowTypes.ADDRESS_OPTION,
      });
    });
    rows.push({
      icon: 'arrowBack',
      id: 'import_wallet',
      label: 'Import a Wallet',
      onPress: onPressImportSeedPhrase,
      rowType: RowTypes.WALLET_OPTION,
    });

    setRows(rows);
  }, [allWallets, onChangeAccount, onPressAddAccount, onPressImportSeedPhrase]);

  // Update the data provider when rows change
  useEffect(() => {
    const dataProvider = new DataProvider((r1, r2) => {
      if (r1.rowType !== r2.rowType) {
        return true;
      }

      if (r1.id !== r2.id) {
        return true;
      }

      return false;
    }).cloneWithRows(rows);
    setDataProvider(dataProvider);
  }, [rows]);

  useEffect(() => {
    setLayoutProvider(
      new LayoutProvider(
        i => {
          if (!rows || !rows.length) return RowTypes.WALLET;
          if (i === rows.length - 1) {
            return RowTypes.LAST_ROW;
          } else {
            return rows[i].rowType;
          }
        },
        (type, dim) => {
          if (type === RowTypes.WALLET) {
            dim.width = deviceUtils.dimensions.width;
            dim.height = rowHeight + 10;
          } else if (type === RowTypes.WALLET_OPTION) {
            dim.width = deviceUtils.dimensions.width;
            dim.height = rowHeight;
          } else if (type === RowTypes.ADDRESS) {
            dim.width = deviceUtils.dimensions.width;
            dim.height = rowHeight;
          } else if (type === RowTypes.ADDRESS_OPTION) {
            dim.width = deviceUtils.dimensions.width;
            dim.height = rowHeight;
          } else if (type === RowTypes.LAST_ROW) {
            dim.width = deviceUtils.dimensions.width;
            dim.height = rowHeight + lastRowPadding;
          } else {
            dim.width = 0;
            dim.height = 0;
          }
        }
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEditWallet = useCallback(() => {
    console.log('TODO: edit wallet');
  }, []);

  const renderItem = useCallback(
    item => {
      switch (item.rowType) {
        case RowTypes.WALLET_OPTION:
          return (
            <WalletOption
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
            />
          );
        case RowTypes.ADDRESS_OPTION:
          return (
            <AddressOption
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
            />
          );
        case RowTypes.WALLET:
          return (
            <WalletRow
              id={item.id}
              accountName={item.name}
              accountColor={item.color}
              addresses={item.addresses}
              currentlyOpenRow={openRow}
              onPress={() => goBack()}
              onTouch={id => setOpenRow(id)}
              onTransitionEnd={id => setOpenRow(id)}
              selectedAddress={accountAddress}
              onEditWallet={onEditWallet}
            />
          );
        case RowTypes.ADDRESS:
          return (
            <AddressRow
              data={item}
              isSelected={
                accountAddress === get(item, 'address') &&
                get(item, 'wallet_id') === get(currentWallet, 'id')
              }
              onPress={item.onPress}
            />
          );
        default:
          return null;
      }
    },
    [openRow, accountAddress, onEditWallet, currentWallet, goBack]
  );

  const renderRow = useCallback(
    (type, data) => {
      return renderItem(data);
    },
    [renderItem]
  );
  if (!dataProvider) return null;
  return (
    <View style={sx.container}>
      <WalletDivider />
      <View style={{ height }}>
        <RecyclerListView
          style={{ flex: 1, height }}
          rowRenderer={renderRow}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          optimizeForInsertDeleteAnimations
        />
      </View>
    </View>
  );
}

export default WalletList;

WalletList.propTypes = {
  accountAddress: PropTypes.string,
  allWallets: PropTypes.object,
  currentWallet: PropTypes.object,
  height: PropTypes.number,
  onChangeAccount: PropTypes.func,
  onPressAddAccount: PropTypes.func,
  onPressImportSeedPhrase: PropTypes.func,
};
