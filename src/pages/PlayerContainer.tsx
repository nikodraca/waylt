import React from 'react';
import styled from 'styled-components';

import { PlayerPreferences, SlackUserData, SpotifyTrack } from '../../electron/types';
import { Button } from '../components/Button';

interface PlayerContainerProps {
  currentlyPlayingTrack: SpotifyTrack;
  playerPreferences: PlayerPreferences;
  userData: SlackUserData;
  ipcRenderer: any;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  color: white;
  font-family: 'Roboto', sans-serif;
  height: 90vh;
  justify-content: space-between;
`;

const User = styled.div`
  margin-top: 5%;
  margin-left: 5%;
  display: flex;
  flex-direction: row;
`;

const UserAvatar = styled.img`
  height: 60px;
  width: 60px;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5%;
`;

const UserName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1d1d18;
  font-family: 'Roboto', sans-serif;
`;

const UserTeamName = styled.span`
  color: #1d1d18;
  font-family: 'Roboto', sans-serif;
`;

const CurrentlyPlaying = styled.div`
  display: flex;
  flex-direction: column;
  height: 30vh;
  background-color: #adaba9;
  justify-content: center;
  align-items: center;
`;

const TrackName = styled.div`
  font-weight: 700;
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 5px;
  color: black;
`;

const ArtistName = styled.div`
  font-size: 1em;
  color: black;
`;

const BroadcastContainer = styled.div`
  margin-left: 5%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Dot = styled.span`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;

  background-color: ${({ isIncognito }: { isIncognito: boolean }) =>
    isIncognito ? 'red' : 'green'};
`;

export const PlayerContainer = ({
  currentlyPlayingTrack,
  playerPreferences,
  userData,
  ipcRenderer
}: PlayerContainerProps): JSX.Element => {
  const handleBroadcastToggle = () => {
    ipcRenderer.send('message-to-main', { type: 'TOGGLE_INCOGNITO' });
  };

  return (
    <Container>
      <User>
        <UserAvatar src={userData.userAvatar} alt={userData.userId} />
        <UserInfo>
          <UserName>{userData.userName}</UserName>
          <UserTeamName>{userData.teamName}</UserTeamName>
        </UserInfo>
      </User>

      <BroadcastContainer>
        <Button onClick={handleBroadcastToggle}>
          <Dot isIncognito={playerPreferences.isIncognito} />{' '}
          {playerPreferences.isIncognito ? 'Not Broadcasting' : 'Broadcasting Live'}
        </Button>
      </BroadcastContainer>

      <CurrentlyPlaying>
        {currentlyPlayingTrack && (
          <>
            <TrackName>{currentlyPlayingTrack.title}</TrackName>
            <ArtistName>{currentlyPlayingTrack.artist}</ArtistName>
          </>
        )}
      </CurrentlyPlaying>
    </Container>
  );
};
