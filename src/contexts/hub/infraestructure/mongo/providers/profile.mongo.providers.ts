import { Connection } from 'mongoose';
import HubMongoSchema from '../schemas/hub.mongo.schema';
export const hubsMongoProviders = [
  {
    provide: 'PROFILE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Hub', HubMongoSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
