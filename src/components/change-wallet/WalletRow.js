/* eslint-disable sort-keys */
import GraphemeSplitter from 'grapheme-splitter';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import store from '../../redux/store';
import { createAccountForWallet } from '../../redux/wallets';
import { colors, fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import { Icon } from '../icons';

const sx = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 7.5,
    paddingRight: 15,
  },
  walletName: {
    color: colors.dark,
    fontFamily: fonts.family.SFProText,
    fontSize: Number(fonts.size.large.replace('px', '')),
    fontWeight: fonts.weight.semibold,
    marginTop: 5,
  },
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

export default class WalletRow extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    selectedAddress: PropTypes.string.isRequired,
    accountColor: PropTypes.number.isRequired,
    accountName: PropTypes.string.isRequired,
    isHeader: PropTypes.bool,
    onEditWallet: PropTypes.func,
    onPress: PropTypes.func,
    onTouch: PropTypes.func,
    onTransitionEnd: PropTypes.func,
  };

  static defaultProps = {
    isHeader: false,
  };

  onAddAccount = async () => {
    console.log(this.props.id);
    store.dispatch(createAccountForWallet(this.props.id));
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
              height={12}
              width={12}
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
      selectedAddress,
      accountName,
      accountColor,
      isHeader,
      onPress,
    } = this.props;

    const avatarSize = isHeader ? 32 : 30;
    const name = accountName ? removeFirstEmojiFromString(accountName) : '';
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        rightThreshold={20}
        renderRightActions={this.renderRightActions}
        onSwipeableWillOpen={() => {
          this.props.onTransitionEnd(selectedAddress);
          this.isTouched = false;
        }}
      >
        <ButtonPressAnimation
          scaleTo={0.96}
          onPress={onPress}
          onPressStart={() => {
            this.isTouched = true;
            this.props.onTouch(selectedAddress);
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
                <Text style={sx.walletName}>{name}</Text>
              </View>
            </View>
          </View>
        </ButtonPressAnimation>
      </Swipeable>
    );
  }
}
