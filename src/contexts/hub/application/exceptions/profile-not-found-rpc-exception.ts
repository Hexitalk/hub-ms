import { RpcException } from '@nestjs/microservices';

export class HubNotFoundRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'hub.error.hub-not-found' }); // i18n key
  }
}
