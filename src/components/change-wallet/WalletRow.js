/* eslint-disable sort-keys */
import GraphemeSplitter from 'grapheme-splitter';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import { colors, fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import { Icon } from '../icons';

const avatarSize = 30;
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

export default function WalletRow({
  accountColor,
  accountName,
  currentlyOpenRow,
  id,
  onEditWallet,
  onTouch,
  onTransitionEnd,
  selectedAddress,
}) {
  const swipeableRow = useRef();

  const close = useCallback(() => {
    swipeableRow.current.close();
  }, []);

  const onPressRow = useCallback(() => {
    close();
  }, [close]);

  const onPressEdit = useCallback(() => {
    close();
    onEditWallet();
  }, [close, onEditWallet]);

  useEffect(() => {
    if (id !== currentlyOpenRow) {
      close();
    }
  }, [close, currentlyOpenRow, id]);

  const onLongPress = useCallback(() => {
    swipeableRow.current.openRight();
  }, []);

  const renderRightAction = useCallback((x, progress, onPress) => {
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
  }, []);

  const renderRightActions = useCallback(
    progress => (
      <View style={{ flexDirection: 'row', width: 50 }}>
        {renderRightAction(50, progress, onPressEdit)}
      </View>
    ),
    [onPressEdit, renderRightAction]
  );

  const name = accountName ? removeFirstEmojiFromString(accountName) : '';

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      rightThreshold={20}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        onTransitionEnd(selectedAddress);
      }}
    >
      <ButtonPressAnimation
        scaleTo={0.96}
        onPress={onPressRow}
        onPressStart={() => {
          onTouch(selectedAddress);
        }}
        onLongPress={onLongPress}
      >
        <View style={[sx.container, { padding: 10 }]}>
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
                    fontSize: 16,
                    lineHeight: 30.5,
                    marginLeft: 0.2,
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

WalletRow.propTypes = {
  accountColor: PropTypes.number.isRequired,
  accountName: PropTypes.string.isRequired,
  currentlyOpenRow: PropTypes.string,
  id: PropTypes.string.isRequired,
  onEditWallet: PropTypes.func,
  onTouch: PropTypes.func,
  onTransitionEnd: PropTypes.func,
  selectedAddress: PropTypes.string.isRequired,
};
