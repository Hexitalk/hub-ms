import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NatsPayloadInterface } from '../nats/interfaces';

@Injectable()
export class RpcAuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const payloadParam: NatsPayloadInterface<unknown> = context
      .switchToRpc()
      .getData();

    if (!payloadParam.authUserId) {
      throw new UnauthorizedException('user.error.unauthorized');
    }

    return true;
  }
}
