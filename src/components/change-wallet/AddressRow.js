/* eslint-disable sort-keys */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../styles';
import { abbreviations } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import CoinCheckButton from '../coin-row/CoinCheckButton';
import { Icon } from '../icons';
import { Column, Row } from '../layout';
import { TruncatedAddress } from '../text';

const sx = StyleSheet.create({
  accountLabel: {
    color: colors.dark,
    fontFamily: fonts.family.SFProText,
    fontSize: Number(fonts.size.smedium.replace('px', '')),
    fontWeight: fonts.weight.medium,
  },
  addressAbbreviation: {
    fontFamily: fonts.family.SFProText,
    opacity: 0.5,
    textTransform: 'lowercase',
    width: '100%',
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
  accountRow: {
    marginLeft: 0,
  },
  subItem: {
    marginLeft: 15,
  },
  rightContent: {
    marginLeft: 60,
  },
  coinCheck: {
    marginTop: -15,
  },
});

export default class AddressRow extends Component {
  static propTypes = {
    selectedAddress: PropTypes.string.isRequired,
    onEditWallet: PropTypes.func,
    onPress: PropTypes.func,
  };

  static defaultProps = {
    isHeader: false,
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
    const { data, onPress, selectedAddress } = this.props;

    return (
      <View style={[sx.subItem, sx.accountRow]}>
        <Row>
          <Column>
            <View style={sx.coinCheck}>
              <CoinCheckButton
                toggle={data.address === selectedAddress}
                onPress={onPress}
                isAbsolute
              />
            </View>
          </Column>
          <Column>
            <View style={sx.rightContent}>
              <View>
                <Text style={sx.accountLabel}>
                  {data.label || `Account ${data.index + 1}`}
                </Text>
              </View>
              <TruncatedAddress
                firstSectionLength={abbreviations.defaultNumCharsPerSection}
                size="smaller"
                truncationLength={4}
                weight="medium"
                address={data.address}
                style={sx.addressAbbreviation}
              />
            </View>
          </Column>
        </Row>
      </View>
    );
  }
}
