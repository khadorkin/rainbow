import PropTypes from 'prop-types';
import React from 'react';
import { Clipboard, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  compose,
  onlyUpdateForKeys,
  withHandlers,
  withState,
} from 'recompact';
import GraphemeSplitter from 'grapheme-splitter';
import styled from 'styled-components/primitives';
import AvatarImageSource from '../../assets/avatar.png';
import { borders, margin, colors } from '../../styles';
import { abbreviations } from '../../utils';
import CopyTooltip from '../CopyTooltip';
import Divider from '../Divider';
import { Centered, Column, RowWithMargins } from '../layout';
import { FloatingEmojis } from '../floating-emojis';
import { TruncatedAddress } from '../text';
import ProfileAction from './ProfileAction';

const AddressAbbreviation = styled(TruncatedAddress).attrs({
  align: 'center',
  firstSectionLength: abbreviations.defaultNumCharsPerSection,
  size: 'big',
  truncationLength: 4,
  weight: 'bold',
})`
  ${margin(1, 0, 3)};
  width: 100%;
`;

const Container = styled(Centered).attrs({ direction: 'column' })`
  margin-top: 24;
  margin-bottom: 24;
  padding-bottom: 32;
  padding-top: 3;
`;

const AvatarCircle = styled(View)`
  border-radius: 33px;
  margin-bottom: 16px;
  height: 65px;
  width: 65px;
`;

const FirstLetter = styled(Text)`
  width: 100%;
  text-align: center;
  color: #fff;
  font-weight: 600;
  fontSize: 30;
  lineHeight: 64;
`;

const ProfileMasthead = ({
  accountAddress,
  accountColor,
  accountName,
  emojiCount,
  onPressCopy,
  onPressReceive,
  showBottomDivider,
}) => (
  <Container>
    <AvatarCircle style={{ backgroundColor: colors.avatarColor[accountColor] }} >
      <FirstLetter>
        {accountName && (new GraphemeSplitter().splitGraphemes(accountName)[0])}
      </FirstLetter>
    </AvatarCircle>
    <CopyTooltip textToCopy={accountAddress} tooltipText="Copy Address">
      <AddressAbbreviation address={accountAddress} />
    </CopyTooltip>
    <RowWithMargins align="center" margin={1}>
      <Column>
        <ProfileAction
          icon="copy"
          onPress={onPressCopy}
          scaleTo={0.82}
          text="Copy"
        />
        <FloatingEmojis
          count={emojiCount}
          distance={130}
          emoji="+1"
          size="h2"
        />
      </Column>
      <ProfileAction
        icon="inbox"
        onPress={onPressReceive}
        scaleTo={0.82}
        text="Receive"
      />
    </RowWithMargins>
    {showBottomDivider && <Divider style={{ bottom: 0, position: 'absolute' }} />}
  </Container>
);

ProfileMasthead.propTypes = {
  accountAddress: PropTypes.string,
  accountColor: PropTypes.number,
  accountName: PropTypes.string,
  emojiCount: PropTypes.number,
  onPressCopy: PropTypes.func,
  onPressReceive: PropTypes.func,
  showBottomDivider: PropTypes.bool,
};

ProfileMasthead.defaultProps = {
  showBottomDivider: true,
};

export default compose(
  withState('emojiCount', 'setEmojiCount', 0),
  withHandlers({
    onPressCopy: ({ accountAddress, emojiCount, setEmojiCount }) => () => {
      setEmojiCount(emojiCount + 1);
      Clipboard.setString(accountAddress);
    },
    onPressReceive: ({ navigation }) => () => navigation.navigate('ReceiveModal'),
  }),
  onlyUpdateForKeys(['accountAddress', 'accountColor', 'accountName', 'emojiCount', 'showBottomDivider']),
)(ProfileMasthead);
