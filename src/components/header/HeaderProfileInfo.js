/* eslint-disable sort-keys */
import GraphemeSplitter from 'grapheme-splitter';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Caret from '../../assets/family-dropdown-arrow.png';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import { useAccountSettings, useWallets } from '../../hooks';
import { colors, fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';

const sx = StyleSheet.create({
  container: {
    height: 46,
    backgroundColor: colors.skeleton,
    marginLeft: 6,
    borderRadius: 23,
    alignItems: 'center',
    flexDirection: 'row',
  },
  topRow: {
    flexDirection: 'row',
  },
  arrowWrapper: {
    height: 16,
    width: 12,
    paddingLeft: 10,
    paddingRight: 20,
    paddingTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nickname: {
    fontFamily: fonts.family.SFProText,
    fontWeight: fonts.weight.medium,
    fontSize: Number(fonts.size.smedium.replace('px', '')),
    color: colors.dark,
    maxWidth: 120,
  },
  settingsIcon: {
    height: 12,
    width: 6,
    transform: [{ rotate: '90deg' }],
  },
  avatarCircle: {
    borderRadius: 20,
    marginLeft: 8,
    marginRight: 9,
    height: 32,
    width: 32,
  },
  firstLetter: {
    width: '100%',
    textAlign: 'center',
    color: colors.white,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 31,
    paddingLeft: 0.5,
  },
});

const HeaderProfileInfo = ({ onPress }) => {
  const {
    selected: { wallet: selectedWallet },
  } = useWallets();
  const { accountAddress } = useAccountSettings();

  const { name, color: accountColor } = selectedWallet;
  let accountName = name;
  const selectedAddress = selectedWallet.addresses.find(
    wallet => wallet.address === accountAddress
  );
  if (get(selectedAddress, 'label')) accountName = selectedAddress.label;

  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
      <View style={sx.container}>
        <View
          style={[
            sx.avatarCircle,
            { backgroundColor: colors.avatarColor[accountColor] },
          ]}
        >
          <Text style={sx.firstLetter}>
            {new GraphemeSplitter().splitGraphemes(accountName)[0]}
          </Text>
        </View>
        <View>
          <View style={sx.topRow}>
            <Text style={sx.nickname} numberOfLines={1}>
              {removeFirstEmojiFromString(accountName)}
            </Text>
            <View style={sx.arrowWrapper}>
              <FastImage style={sx.settingsIcon} source={Caret} />
            </View>
          </View>
        </View>
      </View>
    </ButtonPressAnimation>
  );
};

HeaderProfileInfo.defaultProps = {
  accountColor: 0,
  accountName: '',
};

HeaderProfileInfo.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default HeaderProfileInfo;
