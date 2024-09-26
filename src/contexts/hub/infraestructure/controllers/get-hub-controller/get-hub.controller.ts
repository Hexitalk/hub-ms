import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetHubUseCase } from 'src/contexts/hub/application/use-cases/get-hub-use-case/get-hub.use-case';
import { RpcAuthGuard } from 'src/contexts/shared/guards/rpc-auth.guard';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller('hubs')
export class GetHubController {
  constructor(private readonly getHubUseCase: GetHubUseCase) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'hub.get-hub' })
  run(@Payload() payload: NatsPayloadInterface<void>) {
    const { data, ...config } = payload;

    return this.getHubUseCase.run(config);
  }
}
