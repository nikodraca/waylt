import React from 'react';
import styled from 'styled-components';

import { Button } from './Button';

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-right: 10px;
  padding: 7px;
  background-color: green;
  color: white;
`;

const Text = styled.span`
  margin-right: 25px;
`;

interface BannerProps {
  text: string;
  actionText: string;
  onClick?: () => any;
}

export const Banner = ({ text, onClick, actionText }: BannerProps) => {
  return (
    <Container>
      <Text>{text}</Text>
      <Button onClick={onClick}>{actionText}</Button>
    </Container>
  );
};
