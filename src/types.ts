type MessageType = 'AUTH' | 'CURRENTLY_PLAYING';

export interface Message {
  type: MessageType;
  body: any;
}
