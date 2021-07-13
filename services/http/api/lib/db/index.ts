import { Neogma } from 'neogma';

import { Parameters } from 'neo4j-driver/types/query-runner';
import { Driver, Result, Session } from 'neo4j-driver';
import { TransactionConfig } from 'neo4j-driver-core';
import {
  identity,
  measurement,
  resource,
  source,
  time,
  user,
  AllModels,
} from '../models';
import { InternalError } from '../errors';
import { debug } from '../logging';

class DatabaseError extends InternalError {
  constructor(error: string) {
    super(error);
  }
}

export type DatabaseProcedure<T> = (session: Session, all: AllModels) => Promise<T>;

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
        username: 'neo4j',
        password: 'password',
      },
      {
        logger: debug,
      },
    );
    this.initAllModels(this.neogma);
    this.driver = this.neogma.driver;
    this.initialized = true;
  }

  async exec<T>(proc: DatabaseProcedure<T>): Promise<T> {
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

  initAllModels(db: Neogma): void {
    const resourceModel = resource.initResourceModel(db);
    const identityModel = identity.initIdentityModel(db, resourceModel);
    const userModel = user.initUserModel(db, resourceModel);

    const hourModel = time.initHourModel(db);
    const dayModel = time.initDayModel(db);
    const monthModel = time.initMonthModel(db, dayModel);
    const yearModel = time.initYearModel(db);
    const timestampModel = time.initTimestampModel(db);
    const sourceModel = source.initSourceModel(db);

    const measurementModel = measurement.initMeasurementModel(db,
      hourModel,
      dayModel,
      monthModel,
      yearModel,
      timestampModel,
      userModel);
    const measurementTypeModel = measurement.initMeasurementTypeModel(db,
      measurementModel,
      sourceModel);

    measurementModel.addRelationships(
      {
        MeasurementType: {
          model: measurementTypeModel,
          direction: 'in',
          name: 'Includes',
        },
      },
    );

    this.models = {
      source: sourceModel,
      resource: resourceModel,
      measurementType: measurementTypeModel,
      identity: identityModel,
      user: userModel,
      measurement: measurementModel,
      hour: hourModel,
      day: dayModel,
      month: monthModel,
      year: yearModel,
      timestamp: timestampModel,
    };
  }
}

export function database(): Database {
  const db = new Database();
  db.init();
  return db;
}
