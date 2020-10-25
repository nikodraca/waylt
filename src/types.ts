type MessageType = 'AUTH' | 'CURRENTLY_PLAYING' | 'PLAYER_PREFERENCES' | 'TOGGLE_INCOGNITO';

export interface Message {
  type: MessageType;
  body: any;
}

export interface PlayerPreferences {
  isIncognito: boolean;
}
