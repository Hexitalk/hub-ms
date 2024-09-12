import { RpcException } from '@nestjs/microservices';

export class FailCreateHubRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'hub.error.fail-create-hub' }); // i18n key
  }
}
