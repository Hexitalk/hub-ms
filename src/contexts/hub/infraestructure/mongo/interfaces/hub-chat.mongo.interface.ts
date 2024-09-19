import { Document } from 'mongoose';

export interface HubChatMongoInterface extends Document {
  readonly _id: string;
  user_id: string;
  slot: number; // 1 - 6
  profile_id: string;
  last_message_date: string;
  unread_messages: number;
}
