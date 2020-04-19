/* eslint-disable sort-keys */
import PropTypes from 'prop-types';
import React from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet, View, Text } from 'react-native';
import GraphemeSplitter from 'grapheme-splitter';
import { ButtonPressAnimation } from '../animations';
import { colors, fonts } from '../../styles';
import Caret from '../../assets/family-dropdown-arrow.png';
import { TruncatedAddress } from '../text';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';

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
  addressAbbreviation: {
    color: colors.blueGreyDark,
    fontFamily: fonts.family.SFProText,
    opacity: 0.5,
    paddingRight: 15,
    width: '100%',
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

const HeaderProfileInfo = ({
  accountAddress,
  accountColor,
  accountName,
  onPress,
}) => {
  const name = accountName || 'My Wallet';
  const color = accountColor || 0;
  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
      <View style={sx.container}>
        <View
          style={[
            sx.avatarCircle,
            { backgroundColor: colors.avatarColor[color] },
          ]}
        >
          <Text style={sx.firstLetter}>
            {new GraphemeSplitter().splitGraphemes(name)[0]}
          </Text>
        </View>
        <View>
          <View style={sx.topRow}>
            <Text style={sx.nickname} numberOfLines={1}>
              {removeFirstEmojiFromString(name)}
            </Text>
            <View style={sx.arrowWrapper}>
              <FastImage style={sx.settingsIcon} source={Caret} />
            </View>
          </View>
          <TruncatedAddress
            firstSectionLength={6}
            size="smaller"
            truncationLength={4}
            weight="medium"
            address={accountAddress}
            style={sx.addressAbbreviation}
          />
        </View>
      </View>
    </ButtonPressAnimation>
  );
};

HeaderProfileInfo.propTypes = {
  accountAddress: PropTypes.string,
  accountColor: PropTypes.number,
  accountName: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

export default HeaderProfileInfo;
