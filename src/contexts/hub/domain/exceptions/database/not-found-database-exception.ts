import { DatabaseException } from './database-exception';

export class NotFoundDatabaseException extends DatabaseException {
  constructor(entity: string) {
    super(`${entity} not found`);
    this.name = 'NotFoundDatabaseException';
  }
}
