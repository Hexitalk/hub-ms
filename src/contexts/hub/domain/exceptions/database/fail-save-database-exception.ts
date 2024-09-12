import { DatabaseException } from './database-exception';

export class FailSaveDatabaseException extends DatabaseException {
  constructor(entity: string) {
    super(`${entity} can´t be saved`);
    this.name = 'FailSaveDatabaseException';
  }
}
