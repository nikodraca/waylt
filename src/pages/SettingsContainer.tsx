import React from 'react';
import styled from 'styled-components';

import { LogoutIcon } from '../components/icons';

interface SettingsContainerProps {
  ipcRenderer: any;
}

const Container = styled.div`
  height: 90vh;
  position: absolute;
  top: 0;
  z-index: 2;
  margin-top: 32px;
  background-color: white;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  margin: 5%;
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
`;

const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid #3f3488;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  border-radius: 4px;
  color: #3f3488;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90px;
  justify-content: space-around;
`;

export const SettingsContainer = ({ ipcRenderer }: SettingsContainerProps): JSX.Element => {
  const handleLogout = () => {
    ipcRenderer.send('message-to-main', { type: 'LOGOUT' });
  };

  return (
    <Container>
      <Content>
        <Title>Settings</Title>

        <LogoutButton onClick={handleLogout}>
          <LogoutIcon /> Logout
        </LogoutButton>
      </Content>
    </Container>
  );
};
