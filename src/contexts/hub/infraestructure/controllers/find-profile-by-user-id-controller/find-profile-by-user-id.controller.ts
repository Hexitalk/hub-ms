import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindHubByUserIdUseCase } from 'src/contexts/hubs/application/use-cases';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller('hubs')
export class FindHubByUserIdController {
  constructor(
    private readonly findHubByUserIdUseCase: FindHubByUserIdUseCase,
  ) {}

  @MessagePattern({ cmd: 'hubs.find-hub-by-user-id' })
  run(@Payload() payload: NatsPayloadInterface<string>) {
    const { data: user_id, ...config } = payload;
    return this.findHubByUserIdUseCase.run(user_id, config);
  }
}
