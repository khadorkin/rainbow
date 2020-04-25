/* eslint-disable sort-keys */
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../styles';
import { abbreviations } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import CoinCheckButton from '../coin-row/CoinCheckButton';
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

export default function AddressRow({ data, onPress, isSelected }) {
  return (
    <View style={[sx.subItem, sx.accountRow]}>
      <ButtonPressAnimation onPress={onPress}>
        <Row>
          <Column>
            <View style={sx.coinCheck}>
              <CoinCheckButton toggle={isSelected} isAbsolute />
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
      </ButtonPressAnimation>
    </View>
  );
}

AddressRow.propTypes = {
  data: PropTypes.object,
  onPress: PropTypes.func,
};
