/* eslint-disable sort-keys */
import GraphemeSplitter from 'grapheme-splitter';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Caret from '../../assets/family-dropdown-arrow.png';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import { colors, fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import { TruncatedAddress } from '../text';

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

HeaderProfileInfo.defaultProps = {
  accountAddress: '',
  accountColor: 0,
  accountName: '',
};

HeaderProfileInfo.propTypes = {
  accountAddress: PropTypes.string,
  accountColor: PropTypes.number,
  accountName: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

export default HeaderProfileInfo;
