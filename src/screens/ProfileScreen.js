import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useIsFocused } from 'react-navigation-hooks';
import AddFundsInterstitial from '../components/AddFundsInterstitial';
import { ActivityList } from '../components/activity-list';
import { BackButton, Header, HeaderButton } from '../components/header';
import HeaderProfileInfo from '../components/header/HeaderProfileInfo';
import { Icon } from '../components/icons';
import { FlexItem, Page } from '../components/layout';
import { ProfileMasthead } from '../components/profile';
import TransactionList from '../components/transaction-list/TransactionList';
import nativeTransactionListAvailable from '../helpers/isNativeTransactionListAvailable';
import NetworkTypes from '../helpers/networkTypes';
import { useAccountSettings, useWallets } from '../hooks';
import { colors, position } from '../styles';

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
  const [switchingAccounts, setSwitchingAccounts] = useState(false);
  const { selected } = useWallets();
  const { accountAddress } = useAccountSettings();
  const isScreenFocused = useIsFocused();

  // Initialize immediately if the screen is focused
  useEffect(() => {
    isScreenFocused &&
      !activityListInitialized &&
      !switchingAccounts &&
      setActivityListInitialized(true);
  }, [activityListInitialized, isScreenFocused, switchingAccounts]);

  // Initialize automatically after 5 seconds
  useEffect(() => {
    setTimeout(() => {
      !activityListInitialized && setActivityListInitialized(true);
    }, ACTIVITY_LIST_INITIALIZATION_DELAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Loading state for account switching
  useEffect(() => {
    setActivityListInitialized(false);
    setSwitchingAccounts(true);
    setTimeout(() => {
      setActivityListInitialized(true);
      setSwitchingAccounts(false);
    }, 500);
  }, [accountAddress]);

  // Don't render before redux is ready
  if (!selected || !selected.wallet) return null;

  const { name: accountName, color: accountColor } = selected.wallet;
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
          addCashAvailable={addCashAvailable}
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
          initialized={activityListInitialized}
          navigation={navigation}
          style={{ flex: 1, marginTop: 10 }}
        />
      ) : (
        <ActivityList
          accountAddress={accountAddress}
          accountColor={accountColor}
          accountName={accountName}
          addCashAvailable={addCashAvailable}
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
          initialized={activityListInitialized}
          isEmpty={isEmpty}
          nativeCurrency={nativeCurrency}
          navigation={navigation}
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
