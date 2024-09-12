import { HubChatModel } from '../models/hub-chat.model';

export abstract class HubChatRepository {
  abstract insert(hub: HubChatModel): Promise<HubChatModel>;
  abstract update(hub: HubChatModel): Promise<HubChatModel>;
  abstract delete(id: string): Promise<HubChatModel>;
  abstract findById(id: string): Promise<HubChatModel | undefined>;
  abstract findBySlot(
    userId: string,
    slot: number,
  ): Promise<HubChatModel | undefined>;
  abstract findByUserId(userId: string): Promise<HubChatModel[]>;
}
