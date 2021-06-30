import { Neogma } from 'neogma';
import { DatabaseResponse } from 'lib/auth/auth_methods';
import { Parameters } from 'neo4j-driver/types/query-runner';
import {
  Result, Session, TransactionConfig, Driver,
} from 'neo4j-driver-core';
import { AllModels, initAllModels } from '../models/initializers';
import { debug } from '../logging';
import { InternalError } from '../errors';

class DatabaseError extends InternalError {
  constructor(error: string) {
    super(error);
  }
}

export class Database {
  driver: Driver | null;

  initialized: boolean;

  neogma: Neogma;

  models: AllModels;

  constructor() {
    this.driver = null;
    this.neogma = null;
    this.initialized = false;
  }

  init(): void {
    this.neogma = new Neogma(
      {
        // use your connection details
        url: `bolt://${process.env.DB_ADDR}:7687`,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
      },
      {
        logger: debug,
      },
    );
    this.models = initAllModels(this.neogma);
    this.driver = this.neogma.driver;
    this.initialized = true;
  }

  async exec(proc: (session: Session, all: AllModels) => DatabaseResponse)
    : Promise<boolean | null> {
    const session = this.driver.session();
    try {
      const ret = await proc(session, this.models);
      return ret;
    } catch (e) {
      if (e instanceof InternalError) {
        throw e;
      } else {
        throw new DatabaseError(e);
      }
    } finally {
      await session.close();
    }
  }

  run(query: string, parameters?: Parameters, config?: TransactionConfig): Result {
    const session: Session = this.driver.session();
    return session.run(query, parameters, config);
  }

  async stop(): Promise<void> {
    await this.driver.close();
  }
}

export function database(): Database {
  const db = new Database();
  db.init();
  return db;
}
