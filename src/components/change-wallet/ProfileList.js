import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  RecyclerListView,
  LayoutProvider,
  DataProvider,
} from 'recyclerlistview';
import { withNavigation } from 'react-navigation';
import { compose } from 'recompact';
import { deviceUtils } from '../../utils';
import { removeFirstEmojiFromString } from '../../helpers/emojiHandler';
import ProfileRow from './ProfileRow';
import ProfileOption from './ProfileOption';
import ProfileDivider from './ProfileDivider';

const rowHeight = 50;
const lastRowPadding = 10;

let position = 0;

const WALLET_ROW = 1;
const WALLET_LAST_ROW = 2;

const sx = StyleSheet.create({
  container: {
    paddingTop: 2,
  },
});

class ProfileList extends React.Component {
  static propTypes = {
    accountAddress: PropTypes.string,
    allProfiles: PropTypes.array,
    currentProfile: PropTypes.object,
    height: PropTypes.number,
    navigation: PropTypes.object,
    onChangeWallet: PropTypes.func,
    onCloseEditProfileModal: PropTypes.func,
    onDeleteWallet: PropTypes.func,
    onPressCreateWallet: PropTypes.func,
    onPressImportSeedPhrase: PropTypes.func,
  };

  constructor(args) {
    super(args);

    this.state = {
      profiles: [],
    };

    this._layoutProvider = new LayoutProvider(
      i => {
        if (this.props.allProfiles && i < this.props.allProfiles.length) {
          return WALLET_ROW;
        }
        return WALLET_LAST_ROW;
      },
      (type, dim) => {
        if (type === WALLET_ROW) {
          dim.width = deviceUtils.dimensions.width;
          dim.height = rowHeight;
        } else if (type === WALLET_LAST_ROW) {
          dim.width = deviceUtils.dimensions.width;
          dim.height = rowHeight + lastRowPadding;
        } else {
          dim.width = 0;
          dim.height = 0;
        }
      }
    );
    this._renderRow = this._renderRow.bind(this);
    this.currentlyOpenProfile = undefined;
    this.touchedContact = undefined;
    this.recentlyRendered = false;
  }

  componentWillReceiveProps = props => {
    const newItems = Object.assign([], props.allProfiles || []);
    for (let i = 0; i < newItems.length; i++) {
      if (this.props.accountAddress === newItems[i].address.toLowerCase()) {
        newItems.splice(i, 1);
        break;
      }
    }
    newItems.push({
      icon: 'plus',
      isOption: true,
      label: 'Create a Wallet',
      onPress: this.props.onPressCreateWallet,
    });
    newItems.push({
      icon: 'arrowBack',
      isOption: true,
      label: 'Import a Wallet',
      onPress: this.props.onPressImportSeedPhrase,
    });

    if (newItems !== this.state.profiles) {
      this.setState({ profiles: newItems });
    }
  };

  shouldComponentUpdate = () => {
    if (position < 0) {
      return false;
    }
    return true;
  };

  closeAllDifferentContacts = address => {
    this.lastTouchedContact = this.touchedContact;
    this.touchedContact = address;
    this.recentlyRendered = false;
    this.setState({ touchedContact: address });
  };

  balancesRenderItem = profile =>
    profile.isOption ? (
      <ProfileOption
        icon={profile.icon}
        label={profile.label}
        onPress={profile.onPress}
      />
    ) : (
      <ProfileRow
        key={profile.address}
        accountName={profile.name}
        accountColor={profile.color}
        accountAddress={profile.address}
        onPress={() => this.props.onChangeWallet(profile)}
        onEditWallet={() =>
          this.props.navigation.navigate('ExpandedAssetScreen', {
            address: profile.address,
            asset: [],
            isCurrentProfile: false,
            onCloseModal: editedProfile => {
              this.props.onCloseEditProfileModal(editedProfile);
              this.props.onDeleteWallet(editedProfile.address);
            },
            profile,
            type: 'profile_creator',
          })
        }
        onTouch={this.closeAllDifferentContacts}
        onTransitionEnd={this.changeCurrentlyUsedContact}
        currentlyOpenProfile={this.touchedContact}
      />
    );

  _renderRow(type, data) {
    return this.balancesRenderItem(data);
  }

  filterContactList = (
    list,
    searchPhrase,
    searchParameter = false,
    separator = ' '
  ) => {
    const filteredList = [];
    if (list && searchPhrase.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const searchedItem = searchParameter
          ? list[i][searchParameter]
          : list[i];
        const splitedWordList = searchedItem.split(separator);
        splitedWordList.push(searchedItem);
        splitedWordList.push(removeFirstEmojiFromString(searchedItem).join(''));
        for (let j = 0; j < splitedWordList.length; j++) {
          if (
            splitedWordList[j]
              .toLowerCase()
              .startsWith(searchPhrase.toLowerCase())
          ) {
            filteredList.push(list[i]);
            break;
          }
        }
      }
    } else {
      return list;
    }
    return filteredList;
  };

  changeCurrentlyUsedContact = address => {
    this.currentlyOpenProfile = address;
  };

  render() {
    const {
      accountAddress,
      currentProfile,
      height,
      navigation,
      onCloseEditProfileModal,
    } = this.props;
    return (
      <View style={sx.container}>
        {currentProfile && (
          <ProfileRow
            accountName={currentProfile.name}
            accountColor={currentProfile.color}
            addresses={currentProfile.addresses}
            selectedAddress={accountAddress}
            isHeader
            onPress={() => navigation.goBack()}
            onEditWallet={() =>
              navigation.navigate('ExpandedAssetScreen', {
                address: currentProfile.address,
                asset: [],
                isCurrentProfile: true,
                onCloseModal: editedProfile =>
                  onCloseEditProfileModal(editedProfile),
                profile: currentProfile,
                type: 'profile_creator',
              })
            }
            onTouch={this.closeAllDifferentContacts}
            onTransitionEnd={this.changeCurrentlyUsedContact}
            isInitializationOver
          />
        )}
        <ProfileDivider />
        <View style={{ height }}>
          <RecyclerListView
            rowRenderer={this._renderRow}
            dataProvider={new DataProvider((r1, r2) => {
              if (this.isInitalized) {
                if (
                  r2 === this.state.profiles[this.state.profiles.length - 2]
                ) {
                  this.isInitalized = false;
                }
                return true;
              }
              if (
                this.touchedContact !== r2.address &&
                this.lastTouchedContact === r2.address &&
                this.currentlyOpenProfile &&
                this.touchedContact !== this.currentlyOpenProfile &&
                !this.recentlyRendered
              ) {
                if (
                  r2 === this.state.profiles[this.state.profiles.length - 2]
                ) {
                  this.recentlyRendered = true;
                }
                return true;
              }
              if (r1 !== r2) {
                return true;
              }
              return false;
            }).cloneWithRows(this.state.profiles)}
            layoutProvider={this._layoutProvider}
            onScroll={(event, _offsetX, offsetY) => {
              position = offsetY;
            }}
            optimizeForInsertDeleteAnimations
          />
        </View>
      </View>
    );
  }
}

export default compose(withNavigation)(ProfileList);
