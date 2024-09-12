import { DatabaseException } from './database-exception';

export class FailDeleteDatabaseException extends DatabaseException {
  constructor(entity: string) {
    super(`${entity} can´t be deleted`);
    this.name = 'FailDeleteDatabaseException';
  }
}
