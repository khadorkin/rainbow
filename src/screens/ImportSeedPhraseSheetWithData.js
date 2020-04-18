import { get } from 'lodash';
import { compose } from 'recompact';
import {
  withIsWalletEmpty,
  withIsWalletImporting,
  withAccountAddress,
} from '../hoc';
import { deviceUtils } from '../utils';
import ImportSeedPhraseSheet from './ImportSeedPhraseSheet';

const ImportSeedPhraseSheetWithData = compose(
  withIsWalletEmpty,
  withIsWalletImporting,
  withAccountAddress
)(ImportSeedPhraseSheet);

ImportSeedPhraseSheetWithData.navigationOptions = ({ navigation }) => ({
  gestureEnabled: get(navigation, 'state.params.gestureEnabled', true),
  gestureResponseDistance: {
    vertical: deviceUtils.dimensions.height / 2,
  },
});

export default ImportSeedPhraseSheetWithData;
