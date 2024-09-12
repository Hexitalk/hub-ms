import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/contexts/shared/database/database.module';
import { NatsModule } from 'src/contexts/shared/nats/nats.module';

import * as path from 'path';
import * as useCases from '../application/use-cases/index';
import * as controllers from './controllers/';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RpcExceptionInterceptor } from '../../shared/interceptors/rpc-exception-translate.interceptor';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { NatsLanguageResolver } from '../../shared/i18n-resolvers/nats-language.resolver';
import { hubsMongoProviders } from './mongo/providers/hub.mongo.providers';
import { HubDbRepository } from './repositories/hub-db.repository';
import { HubRepository } from '../domain/ports/hub.repository';

@Module({
  imports: [
    NatsModule,
    DatabaseModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        loader: I18nJsonLoader,
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: NatsLanguageResolver, options: {} }],
    }),
  ],
  controllers: [...Object.values(controllers)],
  providers: [
    ...hubsMongoProviders,
    ...Object.values(useCases),
    HubDbRepository,
    {
      provide: HubRepository,
      useExisting: HubDbRepository,
    },
    NatsLanguageResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
  exports: [
    ...Object.values(useCases),
    HubDbRepository,
    {
      provide: HubRepository,
      useExisting: HubDbRepository,
    },
  ],
})
export class HubModule {}
