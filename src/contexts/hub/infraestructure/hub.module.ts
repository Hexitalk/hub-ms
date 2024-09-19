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
import { HubChatRepository } from '../domain/ports/hub-chat.repository';
import { HubChatDbRepository } from './repositories/hub-chat-db.repository';
import { hubChatMongoProviders } from './mongo/providers/hub-chat.mongo.providers';

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
    ...hubChatMongoProviders,
    ...Object.values(useCases),
    HubChatDbRepository,
    {
      provide: HubChatRepository,
      useExisting: HubChatDbRepository,
    },
    NatsLanguageResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
  exports: [
    ...Object.values(useCases),
    HubChatDbRepository,
    {
      provide: HubChatRepository,
      useExisting: HubChatDbRepository,
    },
  ],
})
export class HubModule {}
