import { Injectable } from 'src/contexts/shared/dependency-injection/injectable';

import { ClientProxy, RpcException } from '@nestjs/microservices';

import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import { HubChatRepository } from 'src/contexts/hub/domain/ports/hub-chat.repository';
import { FailSaveDatabaseException } from 'src/contexts/hub/domain/exceptions/database/fail-save-database-exception';
import { FailCreateHubChatRpcException } from '../../exceptions';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { HubModelInterface } from 'src/contexts/hub/domain/models/hub.model';

@Injectable()
export class GetHubsPropagateUseCase {
  constructor(
    private readonly hubChatRepository: HubChatRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    userId: string,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<{ hubs: HubModelInterface[] }> {
    let responseHubs: HubModelInterface[] = [];
    let targetProfilesIds: string[] = [];
    let profilesUserIds: { user_id: string; profile_id: string }[] = [];
    let listAllprofiles: any[] = [];

    // const mainUserHub: HubModelInterface = {
    //   user_id: userId,
    //   hub_chats: [],
    // };

    let originProfileId: string;

    try {
      const payloadGetUserProfileId: NatsPayloadInterface<string> = {
        ...config,
        data: userId,
      };

      const resGetUserProfileId = await firstValueFrom(
        this.client.send(
          { cmd: 'profiles.find-profile-by-user-id' },
          payloadGetUserProfileId,
        ),
        { defaultValue: void 0 },
      );

      originProfileId = resGetUserProfileId.profile.id;
    } catch (error) {
      throw new RpcException('error');
    }

    try {
      const resFindQuery =
        await this.hubChatRepository.findByOriginProfileId(originProfileId);

      const mainUserHub: HubModelInterface = {
        user_id: userId,
        hub_chats: resFindQuery.map((h) => h.toInterface()),
      };

      responseHubs.push(mainUserHub);

      targetProfilesIds = resFindQuery
        .map((h) => h.toInterface())
        // .filter(
        //   (c) =>
        //     c.state == HubChatStateEnum.CONNECTED ||
        //     c.state == HubChatStateEnum.REQUEST,
        // )
        .map((t) => t.target_profile_id)
        .filter((e) => e);
    } catch (error) {
      if (error instanceof FailSaveDatabaseException) {
        throw new FailCreateHubChatRpcException();
      }
      throw new RpcException('error');
    }

    if (targetProfilesIds.length) {
      const payloadProfilesUserIds: NatsPayloadInterface<{
        profilesIds: string[];
      }> = {
        ...config,
        data: { profilesIds: targetProfilesIds },
      };

      try {
        const profilesUserIdsResponse: {
          usersIds: { user_id: string; profile_id: string }[];
        } = await firstValueFrom(
          this.client.send(
            { cmd: 'profiles.find-profiles-user-ids' },
            payloadProfilesUserIds,
          ),
        );
        profilesUserIds = profilesUserIdsResponse.usersIds;
      } catch (error) {
        throw new RpcException('error');
      }
    }

    for (let u = 0; u < targetProfilesIds.length; u++) {
      try {
        const targetProfileId = targetProfilesIds[u];
        const resFindRelQuery =
          await this.hubChatRepository.findByOriginProfileId(targetProfileId);
        let targetUserId = '';
        const findUserId = profilesUserIds.find(
          (p) => p.profile_id == targetProfileId,
        );
        if (findUserId) {
          targetUserId = findUserId.user_id;
        }

        const relationHub: HubModelInterface = {
          user_id: targetUserId,
          hub_chats: resFindRelQuery.map((h) => h.toInterface()),
        };
        responseHubs.push(relationHub);
      } catch (error) {
        if (error instanceof FailSaveDatabaseException) {
          throw new FailCreateHubChatRpcException();
        }
        throw new RpcException('error');
      }
    }

    const allTargetProfilesIds: string[] = responseHubs
      .map((h) => h.hub_chats.map((hc) => hc.target_profile_id))
      .flat();

    const payloadAllProfilesInfo: NatsPayloadInterface<{
      profilesIds: string[];
    }> = {
      ...config,
      data: { profilesIds: allTargetProfilesIds },
    };

    try {
      const listProfilesResponse: { profiles: any[] } = await firstValueFrom(
        this.client.send(
          { cmd: 'profiles.find-list-profiles-by-ids' },
          payloadAllProfilesInfo,
        ),
      );
      listAllprofiles = listProfilesResponse.profiles;
    } catch (error) {
      throw new RpcException('error');
    }

    responseHubs = responseHubs.map((h) => {
      h.hub_chats = h.hub_chats.map((hc) => {
        hc.target_profile = listAllprofiles.find(
          (p) => p.id == hc.target_profile_id,
        );
        return hc;
      });
      return h;
    });

    return { hubs: responseHubs };
  }
}
