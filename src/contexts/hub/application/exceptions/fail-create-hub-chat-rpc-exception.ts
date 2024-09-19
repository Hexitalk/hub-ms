import { RpcException } from '@nestjs/microservices';

export class FailCreateHubChatRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'hub.error.fail-create-hub-chat' }); // i18n key
  }
}
