import { HubChatRepository } from '../../domain/ports/hub-chat.repository';
import {
  HubChatModel,
  HubChatModelInterface,
} from '../../domain/models/hub-chat.model';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
// import { NotFoundDatabaseException } from '../../domain/exceptions/database/not-found-database-exception';
import { FailSaveDatabaseException } from '../../domain/exceptions/database/fail-save-database-exception';
import { FailDeleteDatabaseException } from '../../domain/exceptions/database/fail-delete-database-exception';
import { HubChatStateEnum } from '../../domain/enums';

@Injectable()
export class HubChatDbRepository extends HubChatRepository {
  constructor(
    @Inject('HUB_CHAT_MODEL')
    private hubChatModel: Model<HubChatModelInterface>,
  ) {
    super();
  }

  async insert(hubChatEntity: HubChatModel): Promise<HubChatModel> {
    const hub = new this.hubChatModel(hubChatEntity.toInterfaceDb());
    try {
      await hub.save();
    } catch (error) {
      console.log(error);
      throw new FailSaveDatabaseException('hub');
    }

    return HubChatModel.createFromDb(hub.toObject());
  }

  async update(hubChatEntity: HubChatModel): Promise<HubChatModel> {
    const hub = hubChatEntity.toInterfaceDb();
    try {
      const updatedHub = await this.hubChatModel.findOneAndUpdate(
        { _id: hub._id },
        hub,
        {
          new: true,
          upsert: false,
          useFindAndModify: false,
        },
      );

      return HubChatModel.createFromDb(updatedHub.toObject());
    } catch (error) {
      console.log(error);
      throw new FailSaveDatabaseException('hub');
    }
  }

  async delete(id: string): Promise<HubChatModel> {
    const hub = await this.hubChatModel.findByIdAndDelete(id).exec();

    if (!hub) {
      throw new FailDeleteDatabaseException('hub');
    }

    return HubChatModel.createFromDb(hub.toObject());
  }

  async findById(id: string): Promise<HubChatModel | undefined> {
    const hubChat = await this.hubChatModel.findById(id).exec();

    return hubChat ? HubChatModel.createFromDb(hubChat.toObject()) : undefined;
  }

  // async findByUserId(userId: string): Promise<HubChatModel[]> {
  //   const hub = await this.hubChatModel.find({ user_id: userId }).exec();

  //   return hub.map((hubChat) => HubChatModel.createFromDb(hubChat.toObject()));
  // }

  async findBySlot(
    profileId: string,
    slot: number,
  ): Promise<HubChatModel | undefined> {
    const hubChat = await this.hubChatModel
      .findOne({ origin_profile_id: profileId, slot })
      .exec();

    return hubChat ? HubChatModel.createFromDb(hubChat.toObject()) : undefined;
  }

  async findByOriginProfileId(profileId: string): Promise<HubChatModel[]> {
    const hubChats = await this.hubChatModel
      .find({ origin_profile_id: profileId })
      .exec();

    return hubChats.map((hubChat) =>
      HubChatModel.createFromDb(hubChat.toObject()),
    );
  }

  async findByState(
    state: HubChatStateEnum,
    options: {
      excludeProfilesIds?: string[];
      limit?: number;
    } = {},
  ): Promise<HubChatModel[]> {
    let query = this.hubChatModel.find({ state });

    if (options.excludeProfilesIds) {
      query = query.where('origin_profile_id').nin(options.excludeProfilesIds);
      query = query.where('target_profile_id').nin(options.excludeProfilesIds);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(1);
    }

    const hubChat = await query.exec();

    return hubChat.map((e) => HubChatModel.createFromDb(e.toObject()));
  }
}
