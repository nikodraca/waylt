import React from 'react';
import styled from 'styled-components';

import { PlayerPreferences, SlackUserData, SpotifyTrack } from '../../../types';

interface PlayerContainerProps {
  currentlyPlayingTrack: SpotifyTrack;
  playerPreferences: PlayerPreferences;
  userData: SlackUserData;
  ipcRenderer: any;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #070518;
  color: white;
  font-family: 'Lato', sans-serif;
  height: 100vh;
`;

const User = styled.div`
  margin: 10%;
  display: flex;
  flex-direction: row;
  height: 50vh;
`;

const UserAvatar = styled.img`
  height: 60px;
  width: 60px;
  border-radius: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5%;
`;

const UserName = styled.span`
  font-weight: 700;
`;

const BroadcastingButton = styled.button`
  margin-top: 10px;
  background-color: #272637;
  border: none;
  color: white;
  padding: 2%;
  width: 200px;
  border-radius: 5px;
  font-family: 'Lato', sans-serif;
`;

const BroadcastStatus = styled.span`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
  background-color: ${({ isLive }: { isLive: boolean }) => (isLive ? 'green' : 'red')};
`;

const CurrentlyPlaying = styled.div`
  display: flex;
  flex-direction: column;
  height: 50vh;
  background-color: #4038dd;
  border-radius: 15px 15px 0px 0px;
  justify-content: center;
  align-items: center;
`;

const TrackName = styled.div`
  font-weight: 700;
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 5px;
`;

const ArtistName = styled.div`
  font-size: 1em;
`;

export const PlayerContainer = ({
  currentlyPlayingTrack,
  playerPreferences,
  userData,
  ipcRenderer
}: PlayerContainerProps): JSX.Element => {
  const handleClick = () => {
    ipcRenderer.send('message-to-main', { type: 'TOGGLE_INCOGNITO' });
  };

  return (
    <Container>
      <User>
        <UserAvatar src={userData.userAvatar} alt={userData.userId} />
        <UserInfo>
          <UserName>{userData.userName}</UserName>
          <span>{userData.teamName}</span>
          <BroadcastingButton onClick={handleClick}>
            <BroadcastStatus isLive={!playerPreferences.isIncognito} />
            {playerPreferences.isIncognito ? 'Not' : 'Live'} Broadcasting
          </BroadcastingButton>
        </UserInfo>
      </User>

      {currentlyPlayingTrack && (
        <CurrentlyPlaying>
          <TrackName>{currentlyPlayingTrack.title}</TrackName>
          <ArtistName>{currentlyPlayingTrack.artist}</ArtistName>
        </CurrentlyPlaying>
      )}
    </Container>
  );
};
