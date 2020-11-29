import React from 'react';
import styled from 'styled-components';
import Switch from 'react-switch';

import { PlayerPreferences, SlackUserData, SpotifyTrack } from '../../electron/types';

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
  font-family: 'Montserrat', sans-serif;
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
  font-family: 'Montserrat', sans-serif;
`;

const UserTeamName = styled.span`
  color: #1d1d18;
  font-family: 'Montserrat', sans-serif;
`;

const CurrentlyPlaying = styled.div`
  display: flex;
  flex-direction: column;
  height: 30vh;
  background-color: #f4f3fc;
  justify-content: center;
  align-items: center;
`;

const TrackName = styled.div`
  font-weight: 700;
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 5px;
  color: #3f3488;
`;

const ArtistName = styled.div`
  font-size: 1em;
  color: #3f3488;
`;

const BroadcastContainer = styled.div`
  margin-left: 5%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BroadcastStatusText = styled.span`
  font-family: 'Montserrat', sans-serif;
  color: #1d1d18;
  margin-left: 5%;
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
        <Switch
          checked={!playerPreferences.isIncognito}
          onChange={handleBroadcastToggle}
          checkedIcon={false}
          uncheckedIcon={false}
          onHandleColor="#60BF65"
          onColor="#F4F3FC"
          offHandleColor="#C0BECA"
          offColor="#F4F3FC"
        />

        <BroadcastStatusText>
          {playerPreferences.isIncognito ? 'Not Broadcasting' : 'Broadcasting Live'}
        </BroadcastStatusText>
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
