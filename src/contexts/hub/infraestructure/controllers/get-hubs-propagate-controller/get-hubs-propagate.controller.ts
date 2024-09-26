import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcAuthGuard } from 'src/contexts/shared/guards/rpc-auth.guard';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';
import { GetHubsPropagateControllerDto } from './get-hubs-propagate-controller.dto';
import { GetHubsPropagateUseCase } from 'src/contexts/hub/application/use-cases';

@Controller('hubs')
export class GetHubsPropagateController {
  constructor(
    private readonly getHubPropagateUseCase: GetHubsPropagateUseCase,
  ) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'hub.get-hubs-propagate' })
  run(@Payload() payload: NatsPayloadInterface<GetHubsPropagateControllerDto>) {
    const { data, ...config } = payload;
    const { userId } = data;
    return this.getHubPropagateUseCase.run(userId, config);
  }
}
