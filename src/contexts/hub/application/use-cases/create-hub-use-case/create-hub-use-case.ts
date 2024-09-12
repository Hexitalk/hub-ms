import { Injectable } from 'src/contexts/shared/dependency-injection/injectable';

import {
  HubChatModel,
  HubChatModelInterface,
} from 'src/contexts/hub/domain/models/hub-chat.model';
import { RpcException } from '@nestjs/microservices';

import { NatsPayloadConfigInterface } from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import { HubChatRepository } from 'src/contexts/hub/domain/ports/hub-chat.repository';
import { FailSaveDatabaseException } from 'src/contexts/hub/domain/exceptions/database/fail-save-database-exception';
import { FailCreateHubRpcException } from '../../exceptions/fail-create-profile-rpc-exception';

@Injectable()
export class CreateHubUseCase {
  constructor(private readonly hubChatRepository: HubChatRepository) {}

  async run(
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ): Promise<{ hub: HubChatModelInterface[] }> {
    const responseHub: HubChatModelInterface[] = [];

    const { authUserId: userId } = config;

    for (let slot = 1; slot <= 6; slot++) {
      const hubModel = HubChatModel.create({
        user_id: userId,
        last_message_date: '',
        profile_id: '',
        slot,
        unread_messages: 0,
      });

      try {
        const resFindQuery = await this.hubChatRepository.findBySlot(
          userId,
          slot,
        );

        if (!resFindQuery) {
          const resQuery = await this.hubChatRepository.insert(hubModel);
          responseHub.push(resQuery.toInterface());
        }
      } catch (error) {
        if (error instanceof FailSaveDatabaseException) {
          throw new FailCreateHubRpcException();
        }
        throw new RpcException('error');
      }
    }

    return {
      hub: responseHub,
    };
  }
}
