import React from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';

interface SettingsContainerProps {
  ipcRenderer: any;
}

const Container = styled.div`
  height: 90vh;
  position: absolute;
  top: 0;
  z-index: 2;
  margin-top: 55px;
  background-color: white;
  width: 100vw;
  display: flex;
  flex-direction: column;
  border-top: 1px solid black;
`;

const Content = styled.div`
  margin: 5%;
`;

const Title = styled.h1`
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
`;

export const SettingsContainer = ({ ipcRenderer }: SettingsContainerProps): JSX.Element => {
  const handleLogout = () => {
    ipcRenderer.send('message-to-main', { type: 'LOGOUT' });
  };

  return (
    <Container>
      <Content>
        <Title>Settings</Title>

        <Button onClick={handleLogout}>Logout</Button>
      </Content>
    </Container>
  );
};
