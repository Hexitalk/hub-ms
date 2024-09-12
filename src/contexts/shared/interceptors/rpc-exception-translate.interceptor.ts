import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  constructor(private readonly i18nService: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof RpcException) {
          /* const ctx = context.switchToRpc();
          const request = ctx.getContext(); */

          const rpcError = error.getError();
          let translatedMessage = 'errors.internal_error';

          if (typeof rpcError === 'string') {
            translatedMessage = rpcError;
          } else if (
            typeof rpcError === 'object' &&
            rpcError !== null &&
            'message' in rpcError &&
            typeof rpcError.message === 'string'
          ) {
            translatedMessage = rpcError.message;
          }

          const message = this.i18nService.t(translatedMessage, {
            lang: I18nContext.current().lang,
          });

          // Modifica el mensaje en la excepción original
          const modifiedRpcError = { status: 400, message };

          // Re-lanza el mismo RpcException con el mensaje modificado
          error = new RpcException(modifiedRpcError);
        }

        return throwError(() => error);
      }),
    );
  }
}
