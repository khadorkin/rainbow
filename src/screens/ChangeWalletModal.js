import React, { useCallback, useState } from 'react';
import { InteractionManager, StatusBar, View } from 'react-native';
// import { orderBy } from 'lodash';
import { useNavigation } from 'react-navigation-hooks';
import WalletList from '../components/change-wallet/WalletList';
import { LoadingOverlay, Modal } from '../components/modal';
// import { removeFirstEmojiFromString } from '../helpers/emojiHandler';
import { useCreateWallet, useSelectWallet, useWallets } from '../hooks';
import store from '../redux/store';
import { createAccountForWallet } from '../redux/wallets';

const walletRowHeight = 54;

const ChangeWalletModal = () => {
  const {
    wallets: { wallets },
    selected: { wallet: selectedWallet },
    address: accountAddress,
  } = useWallets();

  const { goBack, navigate } = useNavigation();
  const createNewWallet = useCreateWallet();
  const selectWallet = useSelectWallet();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  //const [isChangingWallet, setIsChangingWallet] = useState(false);
  let rowsCount = 0;
  if (wallets) {
    Object.keys(wallets).forEach(key => {
      // Wallet header
      rowsCount += 1;
      // Addresses
      rowsCount += wallets[key].addresses.length;
      // Add account
      rowsCount += 1;
    });
    // Import wallet
    rowsCount += 1;
  }
  let listHeight = walletRowHeight * rowsCount;
  if (listHeight > 298) {
    listHeight = 298;
  }

  const onChangeWallet = useCallback(
    async wallet => {
      await selectWallet(wallet.address);
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
      isCurrentWallet: false,
      isNewWallet: true,
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

  const onCloseEditWalletModal = useCallback(
    // eslint-disable-next-line no-unused-vars
    async editedProfile => {
      // let currentProfile = false;
      // const newProfiles = profiles;
      // let deleteIndex;
      // if (newProfiles) {
      //   for (let i = 0; i < newProfiles.length; i++) {
      //     if (newProfiles[i].address === editedProfile.address) {
      //       if (editedProfile.isDeleted) {
      //         deleteIndex = i;
      //       } else {
      //         newProfiles[i] = editedProfile;
      //       }
      //     }
      //     if (newProfiles[i].address.toLowerCase() === accountAddress) {
      //       currentProfile = newProfiles[i];
      //     }
      //   }
      // }
      // if (editedProfile.isDeleted) {
      //   newProfiles.splice(deleteIndex, 1);
      // }
      // setCurrentProfile(currentProfile);
      // setProfiles(
      //   orderBy(
      //     newProfiles,
      //     [
      //       profile => {
      //         const newEditedProfile = profile.name.toLowerCase();
      //         editedProfile = removeFirstEmojiFromString(newEditedProfile);
      //         return editedProfile;
      //       },
      //     ],
      //     ['asc']
      //   )
      // );
    },
    []
  );

  const onCloseModal = useCallback(() => goBack(), [goBack]);

  const onAddAccount = async wallet_id => {
    console.log(wallet_id);
    store.dispatch(createAccountForWallet(wallet_id));
  };

  const onDeleteWallet = useCallback(
    deleteAddress => console.log('TODO', deleteAddress),
    []
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
        height={listHeight + 30}
        onCloseModal={onCloseModal}
        style={{ borderRadius: 18 }}
      >
        <WalletList
          currentWallet={selectedWallet}
          accountAddress={accountAddress}
          allWallets={wallets}
          height={listHeight}
          onChangeWallet={onChangeWallet}
          onCloseEditWalletModal={onCloseEditWalletModal}
          onDeleteWallet={onDeleteWallet}
          onPressCreateWallet={onPressCreateWallet}
          onPressImportSeedPhrase={onPressImportSeedPhrase}
          onAddAccount={onAddAccount}
        />
      </Modal>
    </View>
  );
};

export default ChangeWalletModal;
