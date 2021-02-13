import React from 'react';
import styled from 'styled-components';

import { Button } from './Button';

const Container = styled.div``;

interface BannerProps {
  text: string;
  actionText: string;
  onClick?: () => any;
}

export const Banner = ({ text, onClick, actionText }: BannerProps) => {
  return (
    <Container>
      {text}
      <Button onClick={onClick}>{actionText}</Button>
    </Container>
  );
};
