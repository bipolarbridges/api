import { readFileSync } from 'fs';
import path, { join } from 'path';
import { BinaryLike, createHash } from 'crypto';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { Request } from 'express';
import { Session } from 'neo4j-driver-core';
import { DatabaseProcedure } from '../db';
import { IdentityInstance } from '../models/identity';
import { UserInstance } from '../models/user';
import { InternalError } from '../errors';
import { AllModels } from '../models';
import { info } from '../logging';

/* eslint-disable @typescript-eslint/naming-convention */
const __dirname = path.resolve();

class AuthError extends InternalError {
  constructor(error: string) {
    super(error);
  }
}

function basicHash(sec: BinaryLike): string {
  return createHash('sha256')
    .update(sec).digest('hex');
}

type Configuration = {
  [key: string]: {
    protocol: string,
    addr: string,
    port: string
  }
};

const configFile: Configuration = JSON.parse(readFileSync(join(__dirname, 'lib/auth', 'config.json'), 'utf8'));
const config = configFile.auth_server;
info('Config: ', config);

const axiosConfig: AxiosRequestConfig = {
  baseURL: `${config.protocol}://${config.addr}:${config.port}`,
};
const remote: AxiosInstance = axios.create(axiosConfig);

async function getRemoteId(token: BinaryLike) {
  try {
    const res = await remote.post('/validate', { token }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status !== 200) {
      throw new Error('Wrong status code response from remote auth');
    } else if (!res.data.result) {
      return null;
    } else if (!res.data.id) {
      throw new Error('No id from remote auth');
    } else {
      return res.data.id;
    }
  } catch (e) {
    throw new AuthError(e);
  }
}

export type AuthResult = DatabaseProcedure<boolean>;
export type AuthMethod = (req: Request, auth: BinaryLike) => AuthResult;

export const authMethods: AuthMethod[] = [
  // KEY AUTHENTICATION
  (req: Request, auth: BinaryLike) => async (db: Session, models: AllModels) => {
    const ident: IdentityInstance = await models.identity.findOne({
      where: {
        type: 'key',
        check: basicHash(auth),
      },
      session: db,
    });
    if (ident && ident.__existsInDatabase) {
      const perms = await ident.findRelationships({
        alias: 'Resource',
        where: {
          target: {
            path: req.path,
          },
          relationship: {
            method: req.method,
          },
        },
        session: db,
        limit: 1,
      });
      return perms.length === 1;
    }
    return false;
  },
  // USER AUTHENTICATION
  (req: Request, auth: BinaryLike) => async (db: Session, models: AllModels) => {
    const id = await getRemoteId(auth);
    if (!id) {
      return false;
    }
    const user: UserInstance = await models.user.findOne({
      where: {
        uid: id,
      },
      session: db,
    });
    if (!user) {
      return false;
    }
    const perms = await user.findRelationships({
      alias: 'Resource',
      where: {
        target: {
          path: req.path,
        },
        relationship: {
          method: req.method,
        },
      },
      session: db,
      limit: 1,
    });
    return perms.length === 1;
  },
];
