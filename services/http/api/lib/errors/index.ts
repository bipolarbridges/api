import { Response } from 'express';
import { error } from '../logging';

export class InternalError extends Error {
  constructor(err: string) {
    super(err);
  }
}

export function handle() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err:unknown, a: unknown, res: Response, b: unknown): void => {
    error(err);
    res.status(500).send({
      message: 'Internal Error',
    });
  };
}
