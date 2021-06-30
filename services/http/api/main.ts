/* eslint-disable no-restricted-globals */
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { database, Database } from './lib/db';
import api, { CreateMeasurementArgs } from './lib/interface';
import accept from './lib/requests';
import { handle } from './lib/errors';
import auth from './lib/auth';
import * as logs from './lib/logging';

dotenv.config();

const app: Application = express();
const db: Database = database();
app.use(express.json());
app.use(cors());
app.use(accept());
app.use(auth(db));

app.get('/', (req: Request, res: Response) => {
  logs.debug('hello world');
  res.status(200).end();
});

app.post('/client', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.id) {
    res.status(400).send({
      message: 'Missing id field',
    });
  } else {
    const { id } = data;
    const exists = await db.exec(api.userExists(id));
    if (exists) {
      res.status(403).send({
        message: 'Already exists',
      });
    } else {
      await db.exec(api.createUser(id));
      res.status(201).send({
        message: 'Created',
      });
    }
  }
});

app.get('/client/:clientId', async (req: Request, res: Response) => {
  res.status(200).send({
    id: req.params.clientId,
  });
});

app.post('/measurement', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.clientID
      || !data.data
      || !data.data.date || !data.data.dataType || !data.data.value) {
    res.status(400).send({
      message: 'Missing data fields',
    });
  } else {
    logs.debug('date type:', data.data.date, 'type of', typeof data.data.date);
    logs.debug('date type isNaN:', isNaN(data.data.date));
    if (isNaN(data.data.date)) {
      res.status(400).send({
        message: 'date must be a number',
      });
    } else {
      const me: CreateMeasurementArgs = {
        date: data.data.date,
        uid: data.clientID,
        type: data.data.dataType,
        value: data.data.value,
      };
      if (!(await db.exec(api.userExists(me.uid)))) {
        res.status(404).send({
          message: 'Specified client does not exist',
        });
      } else if (!(await db.exec(api.createMeasurement(me)))) {
        res.status(400).send({
          message: 'measurement could not be created',
        });
      } else {
        res.status(201).send({
          message: 'Created',
        });
      }
    }
  }
});

app.use(handle());

const port = 8888;
const host = process.env.API_ADDR;

const server = app.listen(port, host, () => {
  console.log(`Example app listening at http://${host}:${port}`);
});

process.on('SIGINT', async () => {
  await db.stop();
  server.close(() => {
    console.log('\n\nBye.');
    process.exit();
  });
});
