import { Module } from '@nestjs/common';
import { HubModule } from './contexts/hub/infraestructure/hub.module';

@Module({
  imports: [HubModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
