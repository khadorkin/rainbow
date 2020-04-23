import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { useNavigation } from 'react-navigation-hooks';
import { compose } from 'recompact';
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
  height,
  onPressAddAccount,
  onPressImportSeedPhrase,
}) {
  const { goBack } = useNavigation();
  // eslint-disable-next-line no-unused-vars
  const [rows, setRows] = useState([]);
  const [dataProvider, setDataProvider] = useState(null);
  const [layoutProvider, setLayoutProvider] = useState(null);

  useEffect(() => {
    let rows = [];
    if (allWallets) {
      Object.keys(allWallets).forEach(key => {
        const wallet = allWallets[key];
        rows.push({ ...wallet, rowType: RowTypes.WALLET });
        wallet.addresses.forEach(account => {
          rows.push({
            ...account,
            rowType: RowTypes.ADDRESS,
          });
        });
        rows.push({
          icon: 'plus',
          label: 'Add account',
          onPress: () => onPressAddAccount(wallet.id),
          rowType: RowTypes.ADDRESS_OPTION,
        });
      });
      rows.push({
        icon: 'arrowBack',
        label: 'Import a Wallet',
        onPress: onPressImportSeedPhrase,
        rowType: RowTypes.WALLET_OPTION,
      });

      const dataProvider = new DataProvider((r1, r2) => {
        if (r1.id !== r2.id) {
          return true;
        }
        return false;
      }).cloneWithRows(rows);

      setRows(rows);
      setDataProvider(dataProvider);

      setLayoutProvider(
        new LayoutProvider(
          i => {
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
    }
  }, [allWallets, onPressAddAccount, onPressImportSeedPhrase]);

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
              selectedAddress={accountAddress}
              onPress={() => goBack()}
              isInitializationOver
            />
          );
        case RowTypes.ADDRESS:
          return (
            <AddressRow
              data={item}
              selectedAddress={accountAddress}
              onPress={() => console.log('yo')}
            />
          );
        default:
          return null;
      }
    },
    [accountAddress, goBack]
  );

  const renderRow = useCallback(
    (type, data) => {
      return renderItem(data);
    },
    [renderItem]
  );

  return (
    <View style={sx.container}>
      <WalletDivider />
      <View style={{ height }}>
        <RecyclerListView
          rowRenderer={renderRow}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          optimizeForInsertDeleteAnimations
        />
      </View>
    </View>
  );
}

export default compose(withNavigation)(WalletList);

WalletList.propTypes = {
  accountAddress: PropTypes.string,
  allWallets: PropTypes.array,
  height: PropTypes.number,
  onPressAddAccount: PropTypes.func,
  onPressImportSeedPhrase: PropTypes.func,
};
