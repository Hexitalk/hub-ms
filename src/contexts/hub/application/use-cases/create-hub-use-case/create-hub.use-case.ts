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
import { NATS_SERVICE } from 'src/config';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CreateHubUseCase {
  constructor(
    private readonly hubChatRepository: HubChatRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    params: { originProfileId: string },
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<{ hub: HubChatModelInterface[] }> {
    const responseHub: HubChatModelInterface[] = [];

    const { originProfileId } = params;

    // const { authUserId: userId } = config;

    // let originProfileId: string;

    // try {
    //   const payloadGetUserProfileId: NatsPayloadInterface<string> = {
    //     ...config,
    //     data: userId,
    //   };

    //   const resGetUserProfileId = await firstValueFrom(
    //     this.client.send(
    //       { cmd: 'profiles.find-profile-by-user-id' },
    //       payloadGetUserProfileId,
    //     ),
    //     { defaultValue: void 0 },
    //   );

    //   originProfileId = resGetUserProfileId.id;
    // } catch (error) {
    //   throw new RpcException('error');
    // }

    for (let slot = 1; slot <= 6; slot++) {
      const hubModel = HubChatModel.create({
        origin_profile_id: originProfileId,
        target_profile_id: null,
        last_message_date: '',
        slot,
        unread_messages: 0,
        state: HubChatStateEnum.CLOSE,
      });

      try {
        const resFindQuery = await this.hubChatRepository.findBySlot(
          originProfileId,
          slot,
        );

        if (!resFindQuery) {
          const resQuery = await this.hubChatRepository.insert(hubModel);
          responseHub.push(resQuery.toInterface());
        }
      } catch (error) {
        console.log(error);

        if (error instanceof FailSaveDatabaseException) {
          throw new FailCreateHubChatRpcException();
        }
        throw new RpcException('error');
      }
    }

    return {
      hub: responseHub,
    };
  }
}
