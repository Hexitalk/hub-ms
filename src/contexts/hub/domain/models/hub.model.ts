import { HubChatModelInterface } from './hub-chat.model';

export interface HubModelInterface {
  user_id?: string;
  hub_chats: HubChatModelInterface[];
}
