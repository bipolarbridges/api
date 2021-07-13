import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

type Data = {
  [key:string]: string
};
const DATA : Data = {
  client0token: 'client0@email.com',
  client1token: 'client1@email.com',
  client2token: 'client2@email.com',
  client3token: 'client3@email.com',
};

type ValidationBody = {
  token?: string
};

app.post('/validate', (req, res) => {
  const data: ValidationBody = req.body;
  if (!data?.token) {
    res.status(400).send({
      message: 'Missing token',
    });
  } else if (DATA[data.token]) {
    // match found, reply true and id
    res.status(200).send({
      result: true,
      id: DATA[data.token],
    });
  } else {
    // no match, reply false nad no id
    res.status(200).send({
      result: false,
    });
  }
});

const port = 4000;
const host: string = process.env.SERVER_ADDR;

const server = app.listen(port, host, () => {
  console.log(`Mock auth server listening at http://${host}:${port}`);
});

process.on('SIGINT', async () => {
  server.close(() => {
    console.log('\n\nBye.');
    process.exit();
  });
});
