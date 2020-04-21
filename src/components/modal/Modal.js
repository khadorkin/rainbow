import PropTypes from 'prop-types';
import React from 'react';
import { StatusBar } from 'react-native';
import { colors } from '../../styles';
import { deviceUtils } from '../../utils';
import TouchableBackdrop from '../TouchableBackdrop';
import { Centered, Column } from '../layout';

const Modal = ({
  containerPadding,
  height,
  onCloseModal,
  radius,
  statusBarStyle,
  ...props
}) => (
  <Centered
    direction="column"
    height="100%"
    padding={containerPadding}
    width="100%"
  >
    <StatusBar barStyle={statusBarStyle} />
    <TouchableBackdrop onPress={onCloseModal} />
    <Column
      {...props}
      backgroundColor={colors.white}
      borderRadius={radius}
      height={height}
      shrink={0}
      width="100%"
    />
  </Centered>
);

Modal.propTypes = {
  containerPadding: PropTypes.number.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onCloseModal: PropTypes.func,
  radius: PropTypes.number,
  statusBarStyle: PropTypes.oneOf(['default', 'light-content', 'dark-content']),
};

Modal.defaultProps = {
  containerPadding: 15,
  height: deviceUtils.dimensions.height - 230,
  onCloseModal: () => null,
  radius: 12,
  statusBarStyle: 'light-content',
};

export default Modal;
