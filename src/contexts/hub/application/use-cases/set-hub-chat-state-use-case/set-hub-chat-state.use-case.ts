import { Injectable } from 'src/contexts/shared/dependency-injection/injectable';

import {
  HubChatModel,
  HubChatModelInterface,
} from 'src/contexts/hub/domain/models/hub-chat.model';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import { HubChatRepository } from 'src/contexts/hub/domain/ports/hub-chat.repository';
import { FailSaveDatabaseException } from 'src/contexts/hub/domain/exceptions/database/fail-save-database-exception';
import { FailCreateHubChatRpcException } from '../../exceptions';
import { HubChatStateEnum } from 'src/contexts/hub/domain/enums';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { Inject } from '@nestjs/common';

@Injectable()
export class SetHubChatStateUseCase {
  constructor(
    private readonly hubChatRepository: HubChatRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    userId: string,
    slot: number,
    state: HubChatStateEnum,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<{ hubChat: HubChatModelInterface }> {
    let responseHubChat: HubChatModelInterface;
    let originProfileId: string;
    let targetUserId: string | undefined;

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
      throw new RpcException('error 1');
    }

    try {
      const resFindQuery = await this.hubChatRepository.findBySlot(
        originProfileId,
        slot,
      );

      if (!resFindQuery) {
        throw new RpcException('error 2');
      }

      const hubChatModelUpdateAttrs = {
        ...resFindQuery.toInterface(),
        state,
      };

      if (state === HubChatStateEnum.OPEN || state === HubChatStateEnum.CLOSE) {
        if (hubChatModelUpdateAttrs.target_profile_id) {
          try {
            const payloadGetTargetProfile: NatsPayloadInterface<{
              profilesIds: string[];
            }> = {
              ...config,
              data: {
                profilesIds: [hubChatModelUpdateAttrs.target_profile_id],
              },
            };

            const resGetUserProfileId = await firstValueFrom(
              this.client.send(
                { cmd: 'profiles.find-list-profiles-by-ids' },
                payloadGetTargetProfile,
              ),
              { defaultValue: void 0 },
            );

            const targetProfile: any = resGetUserProfileId.profiles[0];

            if (!targetProfile) {
              throw new RpcException('error 3');
            }

            targetUserId = targetProfile.user_id;

            const targetListHubChat =
              await this.hubChatRepository.findByOriginProfileId(
                targetProfile.id,
              );

            const targetHubChat = targetListHubChat
              .map((h) => h.toInterface())
              .find(
                (e) =>
                  e.target_profile_id ==
                  hubChatModelUpdateAttrs.origin_profile_id,
              );

            if (!targetHubChat) {
              throw new RpcException('error 4');
            }

            const targetHubChatModelUpdate = HubChatModel.create({
              ...targetHubChat,
              state: HubChatStateEnum.CLOSE,
              target_profile_id: null,
            });

            await this.hubChatRepository.update(targetHubChatModelUpdate);
          } catch (error) {
            throw new RpcException('error 5');
          }

          hubChatModelUpdateAttrs.target_profile_id = null;
        }
      }

      const hubChatModelUpdate = HubChatModel.create(hubChatModelUpdateAttrs);

      try {
        const updatedHubChat =
          await this.hubChatRepository.update(hubChatModelUpdate);

        responseHubChat = updatedHubChat.toInterface();

        const payloadSocketEmit: NatsPayloadInterface<{
          userId: string;
        }> = {
          ...config,
          data: { userId },
        };

        await firstValueFrom(
          this.client.send(
            { cmd: 'socket.hub-propagate-emit' },
            payloadSocketEmit,
          ),
          { defaultValue: void 0 },
        );

        if (targetUserId) {
          const payloadSocketEmitTarget: NatsPayloadInterface<{
            userId: string;
          }> = {
            ...config,
            data: { userId: targetUserId },
          };

          await firstValueFrom(
            this.client.send(
              { cmd: 'socket.hub-propagate-emit' },
              payloadSocketEmitTarget,
            ),
            { defaultValue: void 0 },
          );
        }
      } catch (error) {
        throw new RpcException('error 7');
      }
    } catch (error) {
      // if (error instanceof FailSaveDatabaseException) {
      //   throw new FailCreateHubChatRpcException();
      // }
      console.log(error);

      throw new RpcException('error 6');
    }

    return {
      hubChat: responseHubChat,
    };
  }
}
