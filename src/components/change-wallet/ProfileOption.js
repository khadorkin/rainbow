import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import { Icon } from '../icons';

const sx = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 7.5,
    paddingVertical: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.skeleton,
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 9,
    width: 30,
  },
  nickname: {
    color: colors.dark,
    fontFamily: fonts.family.SFProText,
    fontSize: Number(fonts.size.smedium.replace('px', '')),
    fontWeight: fonts.weight.medium,
  },
});

const ProfileOption = ({ icon, isInitializationOver, label, onPress }) =>
  isInitializationOver ? (
    <ButtonPressAnimation scaleTo={0.96} onPress={onPress}>
      <View style={sx.container}>
        <View style={sx.iconWrapper}>
          <Icon
            color={colors.blueGreyDark50}
            height={15}
            width={15}
            name={icon}
          />
        </View>
        <View>
          <Text style={sx.nickname}>{label}</Text>
        </View>
      </View>
    </ButtonPressAnimation>
  ) : (
    <View style={sx.container}>
      <View style={sx.iconWrapper}>
        <Icon
          color={colors.blueGreyDark50}
          height={15}
          width={15}
          name={icon}
        />
      </View>
      <View>
        <Text style={sx.nickname}>{label}</Text>
      </View>
    </View>
  );

ProfileOption.propTypes = {
  icon: PropTypes.string,
  isInitializationOver: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func,
};

export default ProfileOption;
