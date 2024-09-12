import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateHubUseCase } from '../../../application/use-cases/create-hub-use-case/create-hub-use-case';
import { CreateHubControllerDto } from './create-hub-controller.dto';
import { RpcAuthGuard } from 'src/contexts/shared/guards/rpc-auth.guard';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller('hubs')
export class CreateHubController {
  constructor(private readonly createHubUseCase: CreateHubUseCase) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'hubs.create-hub' })
  run(@Payload() payload: NatsPayloadInterface<CreateHubControllerDto>) {
    const { data: createHubDto, ...config } = payload;
    return this.createHubUseCase.run(createHubDto, config);
  }
}
