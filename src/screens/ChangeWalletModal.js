import React, { useEffect, useCallback, useState } from 'react';
import { View, StatusBar, InteractionManager } from 'react-native';
import { orderBy } from 'lodash';
import { Modal, LoadingOverlay } from '../components/modal';
import ProfileList from '../components/change-wallet/ProfileList';
import { removeFirstEmojiFromString } from '../helpers/emojiHandler';
import {
  useAccountSettings,
  useCreateWallet,
  useDeleteWallet,
  useSelectWallet,
} from '../hooks';
import { useNavigation } from 'react-navigation-hooks';

const headerHeight = 68;
const profileRowHeight = 54;

const ChangeWalletModal = () => {
  const { accountAddress } = useAccountSettings();
  const { goBack, navigate, getParam } = useNavigation();
  const createNewWallet = useCreateWallet();
  const deleteWallet = useDeleteWallet();
  const selectWallet = useSelectWallet();
  const [currentProfile, setCurrentProfile] = useState();
  const [profiles, setProfiles] = useState();
  const [isInitializationOver, setIsInitializationOver] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  //const [isChangingWallet, setIsChangingWallet] = useState(false);

  useEffect(() => {
    const profiles = getParam('profiles', []);
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

  const onChangeWallet = useCallback(
    async profile => {
      await selectWallet(profile.address);
      await goBack();
      InteractionManager.runAfterInteractions(() => {
        navigate('WalletScreen');
        setTimeout(() => {
          StatusBar.setBarStyle('dark-content');
        }, 200);
      });
    },
    [goBack, navigate, selectWallet]
  );

  const onPressCreateWallet = useCallback(async () => {
    navigate('ExpandedAssetScreen', {
      actionType: 'Create',
      address: undefined,
      asset: [],
      isCurrentProfile: false,
      isNewProfile: true,
      onCloseModal: isCanceled => {
        if (!isCanceled) {
          setIsCreatingWallet(true);
          setTimeout(async () => {
            // initializeWallet(TBD);
            await createNewWallet();
            goBack();
            // timeout to give time for modal to close
            setTimeout(() => {
              navigate('WalletScreen');
            }, 200);
          }, 20);
        }
      },
      profile: {},
      type: 'profile_creator',
    });
  }, [createNewWallet, goBack, navigate]);

  const onCloseEditProfileModal = useCallback(
    async editedProfile => {
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
    [accountAddress, profiles, setCurrentProfile, setProfiles]
  );

  const onCloseModal = useCallback(() => goBack(), [goBack]);

  const onDeleteWallet = useCallback(
    deleteAddress => deleteWallet(deleteAddress),
    [deleteWallet]
  );

  const onPressImportSeedPhrase = useCallback(() => {
    goBack();
    navigate('ImportSeedPhraseSheet');
  }, [goBack, navigate]);

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

export default ChangeWalletModal;
