import { Injectable } from 'src/contexts/shared/dependency-injection/injectable';

import { ClientProxy } from '@nestjs/microservices';

import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import { HubChatRepository } from 'src/contexts/hub/domain/ports/hub-chat.repository';
import { Inject } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { HubChatStateEnum } from 'src/contexts/hub/domain/enums';
import {
  HubChatModel,
  HubChatModelInterface,
} from 'src/contexts/hub/domain/models/hub-chat.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ContinuousPairHubChatsUseCase {
  private timeBetweenLoops = 6000; // miliseconds

  constructor(
    private readonly hubChatRepository: HubChatRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<void> {
    try {
      let mainOriginId: string;
      let targetProfilesIds: string[];
      // let profilesUserIds: string[];
      let mainHubChat: HubChatModelInterface;

      try {
        const mainHubChatResponse = await this.hubChatRepository.findByState(
          HubChatStateEnum.OPEN,
        );

        const mainHubChatModel = mainHubChatResponse[0];
        if (!mainHubChatModel) {
          throw new Error('error');
        }

        mainHubChat = mainHubChatModel.toInterface();

        mainOriginId = mainHubChat.origin_profile_id;
      } catch (error) {
        throw new Error('error');
      }

      try {
        const resRelationHubChats =
          await this.hubChatRepository.findByOriginProfileId(mainOriginId);

        targetProfilesIds = resRelationHubChats
          .map((h) => h.toInterface())
          // .filter((c) => c.state == HubChatStateEnum.CONNECTED)
          .map((t) => t.target_profile_id)
          .filter((e) => e);
      } catch (error) {
        throw new Error('error');
      }

      // const payloadProfilesUserIds: NatsPayloadInterface<{
      //   profilesIds: string[];
      // }> = {
      //   ...config,
      //   data: { profilesIds },
      // };

      // try {
      //   const profilesUserIdsResponse: { usersIds: string[] } =
      //     await firstValueFrom(
      //       this.client.send(
      //         { cmd: 'profiles.find-profiles-user-ids' },
      //         payloadProfilesUserIds,
      //       ),
      //     );
      //   profilesUserIds = profilesUserIdsResponse.usersIds;
      // } catch (error) {
      //   throw new Error('error');
      // }

      try {
        const resFindQuery = await this.hubChatRepository.findByState(
          HubChatStateEnum.OPEN,
          {
            excludeProfilesIds: [mainOriginId, ...targetProfilesIds],
            limit: 1,
          },
        );

        if (resFindQuery.length) {
          const targetHubChatInterface: HubChatModelInterface =
            resFindQuery[0].toInterface();

          const originUpdateModel = HubChatModel.create({
            ...mainHubChat,
            target_profile_id: targetHubChatInterface.origin_profile_id,
            state: HubChatStateEnum.REQUEST,
          });

          const targetUpdateModel = HubChatModel.create({
            ...targetHubChatInterface,
            target_profile_id: mainHubChat.origin_profile_id,
            state: HubChatStateEnum.REQUEST,
          });

          await this.hubChatRepository.update(originUpdateModel);
          await this.hubChatRepository.update(targetUpdateModel);

          try {
            let originUserId: string;

            const payloadGetProfileUserId: NatsPayloadInterface<{
              profilesIds: string[];
            }> = {
              ...config,
              data: { profilesIds: [mainHubChat.origin_profile_id] },
            };

            const resProfileUserId = await firstValueFrom(
              this.client.send(
                { cmd: 'profiles.find-profiles-user-ids' },
                payloadGetProfileUserId,
              ),
              { defaultValue: void 0 },
            );

            if (resProfileUserId.usersIds.length) {
              originUserId = resProfileUserId.usersIds[0].user_id;
            }

            const payloadSocketEmit: NatsPayloadInterface<{
              userId: string;
            }> = {
              ...config,
              authUserId: originUserId,
              data: { userId: originUserId },
            };

            await firstValueFrom(
              this.client.send(
                { cmd: 'socket.hub-propagate-emit' },
                payloadSocketEmit,
              ),
              { defaultValue: void 0 },
            );
          } catch (error) {
            throw new Error();
          }

          // const targetHubChatInterface: HubChatModelInterface = resFindQuery[0].toInterface();
          // mainHubChat
        }
      } catch (error) {
        throw new Error('error');
      }
    } catch (error) {
      // console.log('error');
    }

    setTimeout(() => {
      this.run(config);
    }, this.timeBetweenLoops);
  }
}
