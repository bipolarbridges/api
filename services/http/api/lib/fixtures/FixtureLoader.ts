import { Database, database, DatabaseProcedure } from '../db';
import { info } from '../logging';

export type Fixture = DatabaseProcedure<void>;

export default class FixtureLoader {
  private db: Database;

  constructor() {
    this.db = database();
  }

  async load(fix: Fixture): Promise<void> {
    info('Clearing out old data...');
    await this.db.run('MATCH (n) DETACH DELETE n;');
    info('Done clearing data.');
    info('Loading fixture data...');
    try {
      await this.db.exec(fix);
    } catch (err) {
      throw new Error(err);
    }
    info('Loaded data.');
  }
}
