import { HubChatStateEnum } from '../enums';

export interface HubChatModelInterface {
  id: string;
  origin_profile_id: string;
  target_profile_id: string | null;
  origin_profile?: any;
  target_profile?: any;
  slot: number; // 1 - 6
  last_message_date: string;
  unread_messages: number;
  state: HubChatStateEnum;
}

export interface HubChatModelInterfaceDb {
  _id: string;
  origin_profile_id: string;
  target_profile_id: string | null;
  origin_profile?: any;
  target_profile?: any;
  slot: number; // 1 - 6
  last_message_date: string;
  unread_messages: number;
  state: HubChatStateEnum;
}

export class HubChatModel {
  private constructor(private attributes: HubChatModelInterface) {}

  static create(attributes: Partial<HubChatModelInterface>): HubChatModel {
    return new HubChatModel({
      id: attributes.id ?? undefined,
      origin_profile_id: attributes.origin_profile_id ?? null,
      target_profile_id: attributes.target_profile_id ?? null,
      origin_profile: attributes.origin_profile ?? undefined,
      target_profile: attributes.target_profile ?? undefined,
      slot: attributes.slot ?? 0,
      last_message_date: attributes.last_message_date ?? '',
      unread_messages: attributes.unread_messages ?? 0,
      state: attributes.state ?? HubChatStateEnum.CLOSE,
    });
  }

  static createFromDb(
    attributes: Partial<HubChatModelInterfaceDb>,
  ): HubChatModel {
    return new HubChatModel({
      id: attributes._id ?? undefined,
      origin_profile_id: attributes.origin_profile_id ?? null,
      target_profile_id: attributes.target_profile_id ?? null,
      origin_profile: attributes.origin_profile ?? undefined,
      target_profile: attributes.target_profile ?? undefined,
      slot: attributes.slot ?? 0,
      last_message_date: attributes.last_message_date ?? '',
      unread_messages: attributes.unread_messages ?? 0,
      state: attributes.state ?? HubChatStateEnum.CLOSE,
    });
  }

  toInterface(): HubChatModelInterface {
    return {
      ...this.attributes,
      id: this.attributes.id.toString(),
      origin_profile_id: this.attributes.origin_profile_id
        ? this.attributes.origin_profile_id.toString()
        : null,
      target_profile_id: this.attributes.target_profile_id
        ? this.attributes.target_profile_id.toString()
        : null,
    };
  }

  toInterfaceDb(): HubChatModelInterfaceDb {
    return { _id: this.attributes.id, ...this.attributes };
  }
}
