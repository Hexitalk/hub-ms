import { I18nResolver } from 'nestjs-i18n';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class NatsLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string {
    const data = context.switchToRpc().getData();

    return data.lang || 'en';
  }
}
