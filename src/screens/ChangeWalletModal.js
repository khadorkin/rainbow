import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { orderBy } from 'lodash';
import { compose, withHandlers, withState } from 'recompact';
import { withNavigation } from 'react-navigation';
import { Modal, LoadingOverlay } from '../components/modal';
import { withIsWalletImporting } from '../hoc';
import ProfileList from '../components/change-wallet/ProfileList';
import { removeFirstEmojiFromString } from '../helpers/emojiHandler';
import { useAccountSettings } from '../hooks';

const headerHeight = 68;
const profileRowHeight = 54;

const ChangeWalletModal = ({
  profiles,
  currentProfile,
  isCreatingWallet,
  isInitializationOver,
  onChangeWallet,
  onCloseEditProfileModal,
  onCloseModal,
  onDeleteWallet,
  onPressCreateWallet,
  onPressImportSeedPhrase,
  navigation,
  setProfiles,
  setCurrentProfile,
  setIsInitializationOver,
}) => {
  const { accountAddress } = useAccountSettings();

  useEffect(() => {
    const profiles = navigation.getParam('profiles', []);
    setProfiles(profiles);
    let currentProfile = false;
    if (profiles) {
      for (let i = 0; i < profiles.length; i++) {
        if (
          profiles[i].address.toLowerCase() === accountAddress.toLowerCase()
        ) {
          currentProfile = profiles[i];
        }
      }
    }
    setCurrentProfile(currentProfile);
    console.log('current profile', currentProfile);
    setTimeout(() => {
      setIsInitializationOver(true);
    }, 130);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size = profiles ? profiles.length - 1 : 0;
  let listHeight = profileRowHeight * 2 + profileRowHeight * size;
  if (listHeight > 258) {
    listHeight = 258;
  }
  return (
    <View>
      {isCreatingWallet && <LoadingOverlay title="Creating Wallet..." />}
      <Modal
        fixedToTop
        height={headerHeight + listHeight}
        onCloseModal={onCloseModal}
        style={{ borderRadius: 18 }}
      >
        <ProfileList
          currentProfile={currentProfile}
          accountAddress={accountAddress}
          allAssets={profiles}
          height={listHeight}
          onChangeWallet={onChangeWallet}
          onCloseEditProfileModal={onCloseEditProfileModal}
          onDeleteWallet={onDeleteWallet}
          onPressCreateWallet={onPressCreateWallet}
          onPressImportSeedPhrase={onPressImportSeedPhrase}
          isInitializationOver={isInitializationOver}
        />
      </Modal>
    </View>
  );
};

ChangeWalletModal.propTypes = {
  currentProfile: PropTypes.object,
  isCreatingWallet: PropTypes.bool,
  isInitializationOver: PropTypes.bool,
  onChangeWallet: PropTypes.func,
  onCloseEditProfileModal: PropTypes.func,
  onCloseModal: PropTypes.func,
  onDeleteWallet: PropTypes.func,
  onPressCreateWallet: PropTypes.func,
  onPressImportSeedPhrase: PropTypes.func,
};

export default compose(
  withNavigation,
  withIsWalletImporting,
  withState('currentProfile', 'setCurrentProfile', undefined),
  withState('profiles', 'setProfiles', undefined),
  withState('isCreatingWallet', 'setIsCreatingWallet', false),
  withState('isChangingWallet', 'setIsChangingWallet', false),
  withState('isInitializationOver', 'setIsInitializationOver', false),
  withHandlers({
    onChangeWallet: ({
      initializeWalletWithProfile,
      navigation,
      setIsChangingWallet,
    }) => async profile => {
      await setIsChangingWallet(true);
      await initializeWalletWithProfile(true, false, profile);
      await navigation.goBack();
      // timeout to give time for modal to close
      setTimeout(() => {
        navigation.navigate('WalletScreen');
      }, 400);
      setTimeout(() => {
        StatusBar.setBarStyle('dark-content');
      }, 600);
      // // timeout prevent changing avatar during screen transition
    },
    onCloseEditProfileModal: ({
      setCurrentProfile,
      setProfiles,
      accountAddress,
      profiles,
    }) => async editedProfile => {
      let currentProfile = false;
      const newProfiles = profiles;
      let deleteIndex;
      if (newProfiles) {
        for (let i = 0; i < newProfiles.length; i++) {
          if (newProfiles[i].address === editedProfile.address) {
            if (editedProfile.isDeleted) {
              deleteIndex = i;
            } else {
              newProfiles[i] = editedProfile;
            }
          }
          if (newProfiles[i].address.toLowerCase() === accountAddress) {
            currentProfile = newProfiles[i];
          }
        }
      }
      if (editedProfile.isDeleted) {
        newProfiles.splice(deleteIndex, 1);
      }
      setCurrentProfile(currentProfile);
      setProfiles(
        orderBy(
          newProfiles,
          [
            profile => {
              const newEditedProfile = profile.name.toLowerCase();
              editedProfile = removeFirstEmojiFromString(newEditedProfile);
              return editedProfile;
            },
          ],
          ['asc']
        )
      );
    },
    onCloseModal: ({ navigation }) => () => navigation.goBack(),
    onDeleteWallet: ({ deleteWallet }) => deleteAddress =>
      deleteWallet(deleteAddress),
    onPressCreateWallet: ({
      createNewWallet,
      navigation,
      clearAccountData,
      setIsCreatingWallet,
      uniswapClearState,
      uniqueTokensClearState,
    }) => () => {
      navigation.navigate('ExpandedAssetScreen', {
        actionType: 'Create',
        address: undefined,
        asset: [],
        isCurrentProfile: false,
        isNewProfile: true,
        onCloseModal: isCanceled => {
          if (!isCanceled) {
            setIsCreatingWallet(true);
            setTimeout(async () => {
              await clearAccountData();
              await uniswapClearState();
              await uniqueTokensClearState();
              await createNewWallet();
              navigation.goBack();
              // timeout to give time for modal to close
              setTimeout(() => {
                navigation.navigate('WalletScreen');
              }, 200);
            }, 20);
          }
        },
        profile: {},
        type: 'profile_creator',
      });
    },
    onPressImportSeedPhrase: ({ navigation }) => () => {
      navigation.goBack();
      navigation.navigate('ImportSeedPhraseSheet');
    },
    setCurrentProfile: ({ setCurrentProfile }) => currentProfile => {
      setCurrentProfile(currentProfile);
    },
    setProfiles: ({ setProfiles }) => profiles => {
      setProfiles(profiles);
    },
  })
)(ChangeWalletModal);
