export interface HubChatModelInterface {
  id: string;
  user_id: string;
  slot: number; // 1 - 6
  profile_id: string;
  last_message_date: string;
  unread_messages: number;
}

export interface HubChatModelInterfaceDb {
  _id: string;
  user_id: string;
  slot: number; // 1 - 6
  profile_id: string;
  last_message_date: string;
  unread_messages: number;
}

export class HubChatModel {
  private constructor(private attributes: HubChatModelInterface) {}

  static create(attributes: Partial<HubChatModelInterface>): HubChatModel {
    return new HubChatModel({
      id: attributes.id ?? undefined,
      user_id: attributes.user_id ?? undefined,
      slot: attributes.slot ?? 0,
      profile_id: attributes.profile_id ?? '',
      last_message_date: attributes.last_message_date ?? '',
      unread_messages: attributes.unread_messages ?? 0,
    });
  }

  static createFromDb(
    attributes: Partial<HubChatModelInterfaceDb>,
  ): HubChatModel {
    return new HubChatModel({
      id: attributes._id ?? undefined,
      user_id: attributes.user_id ?? undefined,
      slot: attributes.slot ?? 0,
      profile_id: attributes.profile_id ?? '',
      last_message_date: attributes.last_message_date ?? '',
      unread_messages: attributes.unread_messages ?? 0,
    });
  }

  toInterface(): HubChatModelInterface {
    return { ...this.attributes };
  }

  toInterfaceDb(): HubChatModelInterfaceDb {
    return { _id: this.attributes.id, ...this.attributes };
  }
}
