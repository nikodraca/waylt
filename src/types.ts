type MessageType = 'AUTH' | 'CURRENTLY_PLAYING' | 'PLAYER_PREFERENCES';

export interface Message {
  type: MessageType;
  body: any;
}

export interface PlayerPreferences {
  isIncognito: boolean;
}
