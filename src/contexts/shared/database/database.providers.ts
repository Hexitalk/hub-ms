import * as mongoose from 'mongoose';
import { envs } from 'src/config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(envs.databaseUrl, {
        dbName: envs.databaseName,
        auth: {
          username: envs.databaseUser,
          password: envs.databasePass,
        },
      }),
  },
];
