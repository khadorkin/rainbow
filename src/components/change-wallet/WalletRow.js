/* eslint-disable sort-keys */
import GraphemeSplitter from 'grapheme-splitter';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import { colors, fonts } from '../../styles';
import { abbreviations } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { Icon } from '../icons';
import { TruncatedAddress } from '../text';
import WalletOption from './WalletOption';

const sx = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 7.5,
    paddingRight: 15,
  },
  nickname: {
    color: colors.dark,
    fontFamily: fonts.family.SFProText,
    fontSize: Number(fonts.size.smedium.replace('px', '')),
    fontWeight: fonts.weight.medium,
  },
  // addressAbbreviation: {
  //   fontFamily: fonts.family.SFProText,
  //   opacity: 0.5,
  //   textTransform: 'lowercase',
  //   width: '100%',
  // },
  // address: {
  //   fontFamily: fonts.family.SFProText,
  //   fontSize: Number(fonts.size.smaller.replace('px', '')),
  //   fontWeight: fonts.weight.medium,
  //   width: '100%',
  //   opacity: 0.5,
  //   textTransform: 'lowercase',
  // },
  iconWrapper: {
    height: 30,
    width: 30,
    borderRadius: 14,
    backgroundColor: colors.skeleton,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 19,
  },
  avatarCircle: {
    borderRadius: 20,
    marginLeft: 8,
    marginRight: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstLetter: {
    textAlign: 'center',
    color: colors.white,
    fontWeight: '600',
  },
  leftSide: {
    flexDirection: 'row',
  },
});

// const MoneyAmountWrapper = styled(View)`
//   background-color: ${colors.lightGreen};
//   border-radius: 16;
//   height: 24px;
//   padding: 4px 6.5px;
// `;

// const MoneyAmount = styled(Text)`
//   line-height: 16px;
//   color: colors.moneyGreen,
//   fontWeight: fonts.weight.semibold,
// `;

export default class WalletRow extends Component {
  static propTypes = {
    accountAddress: PropTypes.string.isRequired,
    accountColor: PropTypes.number.isRequired,
    accountName: PropTypes.string.isRequired,
    isHeader: PropTypes.bool,
    isInitializationOver: PropTypes.bool,
    onEditWallet: PropTypes.func,
    onPress: PropTypes.func,
    onTouch: PropTypes.func,
    onTransitionEnd: PropTypes.func,
  };

  static defaultProps = {
    isHeader: false,
  };

  componentWillReceiveProps = () => {
    if (this.props.isInitializationOver && !this.isTouched) {
      this.close();
    }
  };

  onAddAccount = () => {
    console.log('TO DO');
  };

  onPress = () => {
    this.close();
    this.props.onEditWallet();
  };

  onLongPress = () => {
    this._swipeableRow.openRight();
  };

  renderRightAction = (x, progress, onPress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    return (
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          transform: [{ translateX: trans }],
        }}
      >
        <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
          <View style={sx.iconWrapper}>
            <Icon
              color={colors.blueGreyDark50}
              height={15}
              width={15}
              name="gear"
            />
          </View>
        </ButtonPressAnimation>
      </Animated.View>
    );
  };

  renderRightActions = progress => (
    <View style={{ flexDirection: 'row', width: 50 }}>
      {this.renderRightAction(50, progress, this.onPress)}
    </View>
  );

  updateRef = ref => {
    this._swipeableRow = ref;
  };

  close = () => {
    this._swipeableRow.close();
  };

  render() {
    const {
      addresses,
      accountAddress,
      accountName,
      accountColor,
      isHeader,
      onPress,
    } = this.props;
    const avatarSize = isHeader ? 32 : 30;
    const name = accountName ? removeFirstEmojiFromString(accountName) : '';
    return (
      <View>
        <Swipeable
          ref={this.updateRef}
          friction={2}
          rightThreshold={20}
          renderRightActions={this.renderRightActions}
          onSwipeableWillOpen={() => {
            this.props.onTransitionEnd(accountAddress);
            this.isTouched = false;
          }}
        >
          <ButtonPressAnimation
            scaleTo={0.96}
            onPress={onPress}
            onPressStart={() => {
              this.isTouched = true;
              this.props.onTouch(accountAddress);
            }}
            onLongPress={this.onLongPress}
          >
            <View style={[sx.container, { padding: isHeader ? 15 : 10 }]}>
              <View style={sx.leftSide}>
                <View
                  style={[
                    sx.avatarCircle,
                    {
                      backgroundColor:
                        colors.avatarColor[accountColor] || colors.white,
                      height: avatarSize,
                      width: avatarSize,
                    },
                  ]}
                >
                  <Text
                    style={[
                      sx.firstLetter,
                      {
                        fontSize: isHeader ? 18 : 16,
                        lineHeight: isHeader ? 31 : 30.5,
                        marginLeft: isHeader ? 0.5 : 0.2,
                      },
                    ]}
                  >
                    {new GraphemeSplitter().splitGraphemes(accountName)[0]}
                  </Text>
                </View>
                <View>
                  <Text style={sx.nickname}>{name}</Text>
                </View>
              </View>
            </View>
          </ButtonPressAnimation>
        </Swipeable>
        <View>
          {addresses.map(account => (
            <TruncatedAddress
              firstSectionLength={abbreviations.defaultNumCharsPerSection}
              size="smaller"
              truncationLength={4}
              weight="medium"
              address={account.address}
              style={sx.addressAbbreviation}
              key={account.address}
            />
          ))}
          <WalletOption
            icon="plus"
            label="Add account"
            onPress={this.onAddAccount}
          />
        </View>
      </View>
    );
  }
}
