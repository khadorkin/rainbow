import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ActivityList } from '../components/activity-list';
import AddFundsInterstitial from '../components/AddFundsInterstitial';
import { BackButton, Header, HeaderButton } from '../components/header';
import { Icon } from '../components/icons';
import { FlexItem, Page } from '../components/layout';
import { ProfileMasthead } from '../components/profile';
import HeaderProfileInfo from '../components/header/HeaderProfileInfo';
import TransactionList from '../components/transaction-list/TransactionList';
import nativeTransactionListAvailable from '../helpers/isNativeTransactionListAvailable';
import NetworkTypes from '../helpers/networkTypes';
import { colors, position } from '../styles';
import { useAddress, useWallets } from '../hooks';

const ACTIVITY_LIST_INITIALIZATION_DELAY = 5000;

const ProfileScreen = ({
  isEmpty,
  nativeCurrency,
  navigation,
  network,
  requests,
  transactions,
  transactionsCount,
}) => {
  const [activityListInitialized, setActivityListInitialized] = useState(false);
  const accountAddress = useAddress();
  const {
    selected: { wallet },
  } = useWallets();

  const { name: accountName, color: accountColor } = wallet;
  useEffect(() => {
    setTimeout(() => {
      setActivityListInitialized(true);
    }, ACTIVITY_LIST_INITIALIZATION_DELAY);
  }, []);

  const onPressBackButton = () => navigation.navigate('WalletScreen');
  const onPressSettings = () => navigation.navigate('SettingsModal');
  const onPressProfileHeader = async () => {
    navigation.navigate('ChangeWalletModal');
  };
  const addCashInDevNetworks =
    __DEV__ &&
    (network === NetworkTypes.kovan || network === NetworkTypes.mainnet);
  const addCashInProdNetworks = !__DEV__ && network === NetworkTypes.mainnet;
  const addCashAvailable =
    Platform.OS === 'ios' && (addCashInDevNetworks || addCashInProdNetworks);

  return (
    <Page component={FlexItem} style={position.sizeAsObject('100%')}>
      <Header justify="space-between">
        <HeaderButton onPress={onPressSettings}>
          <Icon color={colors.black} name="gear" />
        </HeaderButton>
        <HeaderProfileInfo
          accountAddress={accountAddress}
          accountColor={accountColor}
          accountName={accountName}
          onPress={onPressProfileHeader}
        >
          <Icon name="gear" />
        </HeaderProfileInfo>
        <BackButton
          color={colors.black}
          direction="right"
          onPress={onPressBackButton}
        />
      </Header>
      {nativeTransactionListAvailable ? (
        <TransactionList
          initialized={activityListInitialized}
          navigation={navigation}
          style={{ flex: 1 }}
          header={
            <ProfileMasthead
              accountAddress={accountAddress}
              accountColor={accountColor}
              accountName={accountName}
              addCashAvailable={addCashAvailable}
              navigation={navigation}
              showBottomDivider={!isEmpty}
            />
          }
        />
      ) : (
        <ActivityList
          accountAddress={accountAddress}
          accountColor={accountColor}
          accountName={accountName}
          addCashAvailable={addCashAvailable}
          navigation={navigation}
          initialized={activityListInitialized}
          header={
            <ProfileMasthead
              accountAddress={accountAddress}
              accountColor={accountColor}
              accountName={accountName}
              addCashAvailable={addCashAvailable}
              navigation={navigation}
              showBottomDivider={!isEmpty}
            />
          }
          isEmpty={isEmpty}
          nativeCurrency={nativeCurrency}
          requests={requests}
          transactions={transactions}
          transactionsCount={transactionsCount}
        />
      )}
      {/* Show the interstitial only for mainnet */}
      {isEmpty && network === NetworkTypes.mainnet && (
        <AddFundsInterstitial network={network} />
      )}
    </Page>
  );
};

ProfileScreen.propTypes = {
  isEmpty: PropTypes.bool,
  nativeCurrency: PropTypes.string,
  navigation: PropTypes.object,
  network: PropTypes.string,
  requests: PropTypes.array,
  transactions: PropTypes.array,
  transactionsCount: PropTypes.number,
};

export default ProfileScreen;
