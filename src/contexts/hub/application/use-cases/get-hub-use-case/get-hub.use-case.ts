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
import { Inject } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { HubModelInterface } from 'src/contexts/hub/domain/models/hub.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GetHubUseCase {
  constructor(
    private readonly hubChatRepository: HubChatRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<{ hub: HubModelInterface }> {
    const responseHub: HubModelInterface = {
      hub_chats: [],
    };

    const { authUserId: userId } = config;

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
      responseHub.hub_chats = resFindQuery.map((e) => e.toInterface());
      responseHub.user_id = config.authUserId;
    } catch (error) {
      if (error instanceof FailSaveDatabaseException) {
        throw new FailCreateHubChatRpcException();
      }
      throw new RpcException('error');
    }

    return { hub: responseHub };
  }
}
