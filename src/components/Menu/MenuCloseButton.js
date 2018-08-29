import React from 'react';
import styled from 'styled-components';

import Store from '~/store';
import CloseIcon from '~/images/close.svg';
import { toggle } from '~/AppState';

function toggleMenu() {
  Store.dispatch(toggle());
}

const MenuCloseButton = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    outline: none;
  }
`;

export default props => (
  <MenuCloseButton
    onClick={toggleMenu}
    role="button"
    tabIndex={0}
    className={props.className}
  >
    <CloseIcon />
  </MenuCloseButton>
);