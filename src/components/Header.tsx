import React from 'react';
import styled from 'styled-components';

import { LogoIcon } from './LogoIcon';

const LogoHeader = styled.div`
  margin-left: 11px;
  margin-top: 15px;
`;

export const Header = (): JSX.Element => (
  <LogoHeader>
    <LogoIcon />
  </LogoHeader>
);
