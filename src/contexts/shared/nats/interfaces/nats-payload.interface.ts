import { NatsPayloadConfigInterface } from './nats-payload-config.interface';

export interface NatsPayloadInterface<T> extends NatsPayloadConfigInterface {
  data: T;
}
