import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcAuthGuard } from 'src/contexts/shared/guards/rpc-auth.guard';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';
import { SetHubChatStateControllerDto } from './set-hub-chat-state-controller.dto';
import { SetHubChatStateUseCase } from 'src/contexts/hub/application/use-cases';
import { HubChatStateEnum } from 'src/contexts/hub/domain/enums';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('hubs')
export class SetHubChatStateController {
  constructor(private readonly setHubChatOpenUseCase: SetHubChatStateUseCase) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'hub.set-hub-chat-state' })
  run(@Payload() payload: NatsPayloadInterface<SetHubChatStateControllerDto>) {
    const { data, ...config } = payload;
    const { slot, state } = data;
    const { authUserId } = config;

    // User can´t assign this states to hub chat manually
    if (
      [HubChatStateEnum.CONNECTED, HubChatStateEnum.REQUEST].includes(state)
    ) {
      throw new Error('not valid hub chat enum');
    }

    return this.setHubChatOpenUseCase.run(authUserId, slot, state, config);
  }
}
