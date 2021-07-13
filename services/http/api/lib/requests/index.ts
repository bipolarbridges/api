import { NextFunction, Request, Response } from 'express';
import { info } from '../logging';

export default function accept() {
  return async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    info(`${req.method} ${req.path} ${req.hostname}`);
    next();
  };
}
