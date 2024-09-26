import { Document } from 'mongoose';

export interface HubChatMongoInterface extends Document {
  readonly _id: string;
  origin_profile_id: string;
  target_profile_id: string | null;
  slot: number; // 1 - 6
  last_message_date: string;
  unread_messages: number;
  state: string;
}
