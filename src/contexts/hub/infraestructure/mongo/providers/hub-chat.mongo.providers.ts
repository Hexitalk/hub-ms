import { Connection } from 'mongoose';
import HubChatMongoSchema from '../schemas/hub-chat.mongo.schema';
export const hubChatMongoProviders = [
  {
    provide: 'HUB_CHAT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('HubChat', HubChatMongoSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
