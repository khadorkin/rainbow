import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ShadowStack from 'react-native-shadow-stack';
import { compose, onlyUpdateForKeys, withHandlers } from 'recompact';
import { isAvatarPickerAvailable } from '../../config/experimental';
import { withAccountInfo, withCoinListEdited, withRequests } from '../../hoc';
import { borders, colors } from '../../styles';
import { getFirstGrapheme } from '../../utils';
import Avatar from '../Avatar';
import { OpacityToggler } from '../animations';
import { Badge } from '../badge';
import { Centered, InnerBorder } from '../layout';
import { Text } from '../text';
import HeaderButton from './HeaderButton';

const sx = StyleSheet.create({
  avatar: {
    ...borders.buildCircleAsObject(34),
    zIndex: 10,
  },
  firstLetter: {
    width: '100%',
  },
});

const shadows = [
  [0, 2, 2.5, colors.dark, 0.08],
  [0, 6, 5, colors.dark, 0.12],
];

const ProfileHeaderButton = ({
  accountColor,
  accountName,
  isCoinListEdited,
  onPress,
  pendingRequestCount,
}) => (
  <OpacityToggler
    endingOpacity={0.4}
    isVisible={isCoinListEdited}
    startingOpacity={1}
  >
    <View pointerEvents={isCoinListEdited ? 'none' : 'auto'}>
      <HeaderButton
        onPress={onPress}
        testID="goToProfile"
        transformOrigin="left"
      >
        <Centered>
          {isAvatarPickerAvailable ? (
            <ShadowStack
              backgroundColor={colors.avatarColor[accountColor]}
              borderRadius={65}
              height={34}
              shadows={shadows}
              width={34}
            >
              <View
                backgroundColor={colors.avatarColor[accountColor]}
                style={sx.avatar}
              >
                <Text
                  align="center"
                  color={colors.white}
                  letterSpacing={-0.6}
                  lineHeight={34}
                  size="big"
                  style={sx.firstLetter}
                  weight="regular"
                >
                  {getFirstGrapheme(accountName)}
                </Text>
                <InnerBorder opacity={0.04} radius={34} />
              </View>
            </ShadowStack>
          ) : (
            <Avatar size={34} />
          )}
          {pendingRequestCount > 0 && (
            <Badge delay={1500} value={pendingRequestCount} zIndex={1} />
          )}
        </Centered>
      </HeaderButton>
    </View>
  </OpacityToggler>
);

ProfileHeaderButton.propTypes = {
  onPress: PropTypes.func,
  pendingRequestCount: PropTypes.number,
};

export default compose(
  withAccountInfo,
  withRequests,
  withCoinListEdited,
  withHandlers({
    onPress: ({ navigation }) => () => navigation.navigate('ProfileScreen'),
  }),
  onlyUpdateForKeys([
    'pendingRequestCount',
    'accountColor',
    'accountName',
    'isCoinListEdited',
  ])
)(ProfileHeaderButton);
