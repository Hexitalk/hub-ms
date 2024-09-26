import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateHubUseCase } from '../../../application/use-cases/create-hub-use-case/create-hub.use-case';
import { RpcAuthGuard } from 'src/contexts/shared/guards/rpc-auth.guard';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';
import { CreateHubControllerDto } from './create-hub-controller.dto';

@Controller('hubs')
export class CreateHubController {
  constructor(private readonly createHubUseCase: CreateHubUseCase) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'hub.create-hub' })
  run(@Payload() payload: NatsPayloadInterface<CreateHubControllerDto>) {
    const { data, ...config } = payload;
    const { originProfileId } = data;
    return this.createHubUseCase.run({ originProfileId }, config);
  }
}
