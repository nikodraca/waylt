import React from 'react';
import styled from 'styled-components';

import { LogoIcon, MenuIcon } from './icons';

const HeaderContainer = styled.div`
  width: 100vw;
  height: 32px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 15px;
  margin-right: 15px;
  padding-top: 15px;
`;

const MenuButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
`;

interface HeaderProps {
  isUserAuthenticated: boolean;
  toggleSettingsHandler: any;
}

export const Header = ({
  isUserAuthenticated,
  toggleSettingsHandler
}: HeaderProps): JSX.Element => (
  <HeaderContainer>
    <HeaderContent>
      <LogoIcon />
      {isUserAuthenticated && (
        <MenuButton onClick={toggleSettingsHandler}>
          <MenuIcon />
        </MenuButton>
      )}
    </HeaderContent>
  </HeaderContainer>
);
