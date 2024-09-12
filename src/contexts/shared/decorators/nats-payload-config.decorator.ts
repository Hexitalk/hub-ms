import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NatsPayloadConfigInterface } from '../nats/interfaces';

const defaultConfig: NatsPayloadConfigInterface = {
  lang: 'en',
  authUserId: '',
};

export const NatsPayloadConfig = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToRpc().getContext();

    // Obtiene el valor del parámetro
    const config = context?.config;

    // Si config está vacío o no existe, usar el valor predeterminado
    return config ? config : defaultConfig;
  },
);
