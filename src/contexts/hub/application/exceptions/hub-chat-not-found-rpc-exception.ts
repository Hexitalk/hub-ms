import { RpcException } from '@nestjs/microservices';

export class HubChatNotFoundRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'hub.error.hub-chat-not-found' }); // i18n key
  }
}
