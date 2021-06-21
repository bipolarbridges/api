import { InternalError } from '../errors';
import { Neogma } from 'neogma';
import { debug } from '../logging'
import { initAllModels } from '../models/initializers';
import { Parameters } from 'neo4j-driver/types/query-runner';
import { Driver, Result, Session } from 'neo4j-driver';
import { TransactionConfig } from 'neo4j-driver-core';
import { allModels } from 'lib/models';

class DatabaseError extends InternalError {
    constructor(error: string) {
        super(error);
    }
}

export type DatabaseProcedure<T> = (session: Session, all: allModels) => Promise<T>;

export class Database {
    driver: Driver | null;
    initialized: boolean;
    neogma: Neogma;
    models: allModels;

    constructor () {
        this.driver = null;
        this.neogma = null;
        this.initialized = false;
    }

    init (): void {
        this.neogma = new Neogma(
            {
                // use your connection details
                url: `bolt://${process.env['DB_ADDR']}:7687`,
                username: 'neo4j',
                password: 'password',
            },
            {
                logger: debug,
            },
        );
        this.models = initAllModels(this.neogma);
        this.driver = this.neogma.driver;
        this.initialized = true;
    }

    async exec<T> (proc: DatabaseProcedure<T>): Promise<T> {
        const session = this.driver.session();
        try {
            const ret = await proc(session, this.models);
            return ret
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

    run (query: string, parameters?: Parameters, config?: TransactionConfig): Result {
        const session: Session = this.driver.session();
        return session.run(query, parameters, config);
    }

    async stop (): Promise<void> {
        await this.driver.close();
    }
}

export function database(): Database {
    const db = new Database();
    db.init();
    return db
}

