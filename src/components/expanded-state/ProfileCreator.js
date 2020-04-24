import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useAccountSettings } from '../../hooks';
import { deleteUserInfo, editUserInfo } from '../../model/wallet';
import {
  settingsUpdateAccountColor,
  settingsUpdateAccountName,
} from '../../redux/settings';
import store from '../../redux/store';
import { colors, padding } from '../../styles';
import { abbreviations, deviceUtils } from '../../utils';
import { showActionSheetWithOptions } from '../../utils/actionsheet';
import Divider from '../Divider';
import TouchableBackdrop from '../TouchableBackdrop';
import { ButtonPressAnimation } from '../animations';
import { Button } from '../buttons';
import { ContactAvatar } from '../contacts';
import CopyTooltip from '../copy-tooltip';
import { Input } from '../inputs';
import { Centered, KeyboardFixedOpenLayout } from '../layout';
import { Text, TruncatedAddress } from '../text';
import PlaceholderText from '../text/PlaceholderText';
import FloatingPanels from './FloatingPanels';
import { AssetPanel } from './asset-panel';

const sx = StyleSheet.create({
  addressAbbreviation: {
    marginBottom: 5,
    marginHorizontal: 0,
    marginTop: 9,
    opacity: 0.6,
    width: '100%',
  },
});

export default function ProfileCreator({
  actionType,
  address,
  isCurrentProfile,
  isNewProfile,
  onCloseModal,
  onUnmountModal,
  profile,
  setIsLoading,
}) {
  const { accountAddress } = useAccountSettings();
  const { goBack } = useNavigation();
  const [color, setColor] = useState(
    isNewProfile
      ? Math.floor(Math.random() * colors.avatarColor.length)
      : profile.color
  );
  const [value, setValue] = useState(get(profile, 'name'));
  const inputRef = useRef();
  const text = useRef();

  useEffect(() => {
    if (value.length === 0) {
      text.updateValue('Name');
    }
  }, [value.length]);

  const editProfile = useCallback(async () => {
    if (value.length > 0) {
      const { address, privateKey, seedPhrase } = profile;
      await editUserInfo(value, color, seedPhrase, privateKey, address);
      if (isCurrentProfile) {
        store.dispatch(settingsUpdateAccountName(value));
        store.dispatch(settingsUpdateAccountColor(color));
      }
      onCloseModal({
        address,
        color: color,
        name: value,
        privateKey,
        seedPhrase,
      });
      goBack();
    }
  }, [color, goBack, isCurrentProfile, onCloseModal, profile, value]);

  const addProfileInfo = useCallback(async () => {
    goBack();
    if (setIsLoading) {
      setIsLoading(false);
    }
    await store.dispatch(settingsUpdateAccountName(value));
    await store.dispatch(settingsUpdateAccountColor(color));
    onCloseModal();
  }, [color, goBack, onCloseModal, setIsLoading, value]);

  const handleDeleteProfile = useCallback(() => {
    showActionSheetWithOptions(
      {
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        message: `Are you sure that you want to delete this wallet?`,
        options: ['Delete Wallet', 'Cancel'],
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          goBack();
          await deleteUserInfo(accountAddress);
          const { address } = profile;
          onCloseModal({
            address,
            isDeleted: true,
          });
        }
      }
    );
  }, [accountAddress, goBack, onCloseModal, profile]);

  const handleCancel = useCallback(() => {
    onUnmountModal('', 0, false);
    if (onCloseModal) {
      onCloseModal();
    }
    goBack();
  }, [goBack, onCloseModal, onUnmountModal]);

  const handleChange = useCallback(({ nativeEvent: { text } }) => {
    const value = text.charCodeAt(0) === 32 ? text.substring(1) : text;
    if (value.length > 0) {
      text.updateValue(' ');
    } else {
      text.updateValue('Name');
    }
    setValue(value);
  }, []);

  const handleChangeColor = useCallback(async () => {
    let newColor = color + 1;
    if (newColor > colors.avatarColor.length - 1) {
      newColor = 0;
    }
    setColor(newColor);
  }, [color]);

  const handleFocusInput = useCallback(async () => {
    if (inputRef) {
      inputRef.focus();
    }
  }, []);

  const acceptAction = isNewProfile ? addProfileInfo : editProfile;

  return (
    <KeyboardFixedOpenLayout>
      <TouchableBackdrop />
      <FloatingPanels maxWidth={deviceUtils.dimensions.width - 110}>
        <AssetPanel>
          <Centered css={padding(24, 25)} direction="column">
            <ButtonPressAnimation onPress={handleChangeColor} scaleTo={0.96}>
              <ContactAvatar
                color={color}
                large
                marginBottom={19}
                value={value}
              />
            </ButtonPressAnimation>
            <PlaceholderText ref={text} />
            <Input
              autoCapitalize
              autoFocus
              letterSpacing={0.2}
              onChange={handleChange}
              onSubmitEditing={acceptAction}
              returnKeyType="done"
              size="big"
              spellCheck="false"
              ref={inputRef}
              style={{ width: '100%' }}
              textAlign="center"
              value={value}
              weight="semibold"
            />
            {isNewProfile || (
              <CopyTooltip
                onHide={handleFocusInput}
                textToCopy={address}
                tooltipText="Copy Address"
              >
                <TruncatedAddress
                  style={sx.addressAbbreviation}
                  address={address}
                  align="center"
                  color={colors.blueGreyDark}
                  firstSectionLength={abbreviations.defaultNumCharsPerSection}
                  size="lmedium"
                  truncationLength={4}
                  weight="regular"
                />
              </CopyTooltip>
            )}
            <Centered paddingVertical={19} width={93}>
              <Divider inset={false} />
            </Centered>
            <Button
              backgroundColor={value.length > 0 ? colors.appleBlue : undefined}
              disabled={!value.length > 0}
              height={43}
              onPress={acceptAction}
              showShadow
              size="small"
              width={215}
            >
              <Text
                color="white"
                size="lmedium"
                style={{ marginBottom: 1.5 }}
                weight="semibold"
              >
                {isNewProfile ? `${actionType} Wallet` : 'Done'}
              </Text>
            </Button>
            <ButtonPressAnimation
              marginTop={11}
              onPress={
                isNewProfile || isCurrentProfile
                  ? handleCancel
                  : handleDeleteProfile
              }
            >
              <Centered backgroundColor={colors.white} css={padding(8, 9)}>
                <Text
                  color={colors.alpha(colors.blueGreyDark, 0.4)}
                  size="lmedium"
                  weight="regular"
                >
                  {isNewProfile || isCurrentProfile
                    ? 'Cancel'
                    : 'Delete Wallet'}
                </Text>
              </Centered>
            </ButtonPressAnimation>
          </Centered>
        </AssetPanel>
      </FloatingPanels>
    </KeyboardFixedOpenLayout>
  );
}

ProfileCreator.propTypes = {
  actionType: PropTypes.string,
  address: PropTypes.string,
  color: PropTypes.number,
  isCurrentProfile: PropTypes.bool,
  isNewProfile: PropTypes.bool,
  onCloseModal: PropTypes.func,
  onUnmountModal: PropTypes.func,
  profile: PropTypes.object,
  setIsLoading: PropTypes.func,
};
