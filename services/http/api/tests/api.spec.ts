/* eslint-disable @typescript-eslint/no-unused-vars */
import jestOpenAPI from 'jest-openapi';
import { resolve } from 'path';
import axios, {
  AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import { fail } from 'assert';

const ax = axios.create({
  baseURL: 'http://127.0.0.1:8888',
});

jestOpenAPI(resolve(process.cwd(), 'reference/bb-api.v0.yaml'));

type Method = {
  [key: string]: AxiosInstance['post']
};

const methods: Method = {
  POST: ax.post,
};

function spec(method: string, path: string) {
  return {
    match: (res: AxiosResponse<unknown>) => {
      res.request.path = path;
      res.request.method = method;
      expect(res).toSatisfyApiSpec();
    },
  };
}

function match(method: string, path: string, body: unknown, opts: AxiosRequestConfig, status: number, desc = 'Unspecified') {
  describe(`${method} ${path} [ ${status}: ${desc} ]`, () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    const _f_ = methods[method];
    if (!_f_) {
      console.log(`WARNING: invalid method specified ${method}`);
    } else {
      it('Should match API spec', async () => methods[method](`${path}`, body, opts)
        .then((res: AxiosResponse<unknown>) => {
          // Should return the correct status code
          expect(res.status).toEqual(status);
          // Should respond according to the schema
          spec(method, path).match(res);
        })
        .catch((err) => {
          if (!err.response) {
            fail();
          } else {
            const res = err.response;
            expect(res.status).toEqual(status);
            spec(method, path).match(res);
          }
        }));
    }
  });
}

describe('Paths', () => {
  describe('/client', () => {
    describe('POST', () => {
      match('POST', '/client',
        {
          id: 'client1@email.com',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'apikey1',
          },
        }, 201,
        'Normal happy case');
      match('POST', '/client',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'apikey1',
          },
        }, 400,
        'Missing data fields');
      match('POST', '/client',
        "I'm not JSON",
        {
          headers: {
            Authorization: 'apikey1',
          },
        }, 400,
        'Invalid JSON in body');
      match('POST', '/client',
        {
          id: 'client1@email.com',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'apikey2',
          },
        }, 403,
        'Bad key');
      it('Should disallow creation of clients with the same id',
        async () => {
          await ax.post('/client', {
            id: 'client2@email.com',
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'apikey1',
            },
          }).then(async (res) => {
            spec('POST', '/client').match(res);
            expect(res.status).toEqual(201);
            await ax.post('/client', {
              id: 'client2@email.com',
            }, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'apikey1',
              },
            }).then((res2) => {
              fail('Should have rejected');
            }).catch((err) => {
              if (!err.response) {
                fail();
              }
              const res3 = err.response;
              spec('POST', '/client').match(res3);
              expect(res3.status).toEqual(403);
              expect(res3.data.message).toEqual('Already exists');
            });
          }).catch((err: AxiosError) => {
            console.log(err?.response?.data);
            fail();
          });
        });
    });
    describe('GET', () => {
      it('Should reject if no authorization provided', async () => {
        await ax.get('/client/client0@email.com')
          .then(async (res) => {
            fail('Should have rejected');
          })
          .catch((err) => {
            if (!err.response) {
              fail();
            }
            const res = err.response;
            spec('GET', '/client').match(res);
            expect(res.status).toEqual(403);
          });
      });
      it('Should reject if unauthorized identity provided', async () => {
        await ax.get('/client/client0@email.com', {
          headers: {
            Authorization: 'client1token',
          },
        })
          .then(async (res) => {
            fail('Should have rejected');
          })
          .catch((err) => {
            if (!err.response) {
              fail();
            }
            const res = err.response;
            spec('GET', '/client').match(res);
            expect(res.status).toEqual(403);
          });
      });
      it('Should allow a client to access own data', async () => {
        await ax.get('/client/client0@email.com', {
          headers: {
            // this maps to the client0 id in the auth server
            Authorization: 'client0token',
          },
        })
          .then(async (res) => {
            spec('GET', '/client').match(res);
            expect(res.status).toEqual(200);
          })
          .catch((err) => {
            console.log('message', err?.response);
            fail();
          });
      });
      // TODO should modify the semantics below:
      it('Should reject if client id does not exist', async () => {
        await ax.get('/client/client(-1)@email.com')
          .then(async (res) => {
            fail('Should have rejected');
          })
          .catch((err) => {
            if (!err.response) {
              fail();
            }
            const res = err.response;
            spec('GET', '/client').match(res);
            expect(res.status).toEqual(403);
          });
      });
      it('Should allow a new client to access own data', async () => {
        await ax.post('/client', {
          id: 'client3@email.com',
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'apikey1',
          },
        }).then(async (res) => {
          spec('POST', '/client').match(res);
          expect(res.status).toEqual(201);
          return ax.get('/client/client3@email.com', {
            headers: {
              Authorization: 'client3token',
            },
          })
            .then(async (res2) => {
              spec('GET', '/client').match(res2);
              expect(res2.status).toEqual(200);
            })
            .catch((err) => {
              console.log(err?.response?.error);
              fail();
            });
        }).catch((err) => {
          console.log(err?.response?.error);
          fail();
        });
      });
    });
  });
  describe('/measurement', () => {
    const validExampleData = {
      clientID: 'client0@email.com',
      data: {
        date: 1610997441,
        name: 'sentiment',
        value: 0.2,
        source: 'measurement',
      },
    };
    it('Should reject if a bad key is provided', async () => {
      await ax.post('/measurement', validExampleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'apikey2',
        },
      }).then(async (res) => {
        fail('Should have rejected');
      }).catch((err) => {
        if (!err.response) {
          fail();
        }
        const res = err.response;
        spec('POST', '/measurement').match(res);
        expect(res.status).toEqual(403);
      });
    });

    const invalidData = [
      // Missing fields
      {
        // clientID: ...
        data: {
          date: 1610997441,
          name: 'sentiment',
          value: 0.8,
          source: 'measurement',

        },
      },
      {
        clientID: 'client2@email.com',
        // data: ...
      },
      {
        clientID: 'client2@email.com',
        data: {
          // data: ...
          name: 'sentiment',
          value: 0.8,
          source: 'measurement',
        },
      },
      {
        clientID: 'client2@email.com',
        data: {
          date: 1610997441,
          // name: ...
          value: 1.3,
          source: 'measurement',
        },
      },
      {
        clientID: 'client2@email.com',
        data: {
          date: 1610997441,
          name: 'sentiment',
          // value: ...,
          source: 'measurement',
        },
      },
      {
        clientID: 'client2@email.com',
        data: {
          date: 1610997433,
          name: 'sentiment',
          value: 1.3,
          // source: ...
        },
      },
      // Bad typing examples
      {
        clientID: 'client0@email.com',
        data: {
          date: 'Jun 1st',
          dataType: 'sentiment',
          value: 0.8,
        },
      },
    ];
    it('Should reject if data fields are missing or have wrong type',
      async () => {
        await Promise.all(invalidData.map((dat) => ax.post('/measurement', dat, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'apikey1',
          },
        }).then(async (res) => {
          fail(`Should have rejected (${JSON.stringify(dat)})`);
        }).catch((err) => {
          if (!err.response) {
            fail(`Error: ${err}`);
          }
          const res = err.response;
          spec('POST', '/measurement').match(res);
          expect(res.status).toEqual(400);
        })));
      });

    it('Should respond properly upon success', async () => {
      await ax.post('/measurement', validExampleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'apikey1',
        },
      }).then(async (res) => {
        spec('POST', '/measurement').match(res);
        expect(res.status).toEqual(201);
      }).catch((err) => {
        console.log(err.response.data);
        fail();
      });
    });

    it('Should reject if client does not exist', async () => {
      await ax.post('/measurement', {
        clientID: 'doesnotexist@email.com',
        data: validExampleData.data,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'apikey1',
        },
      }).then(async (res) => {
        fail('Should have rejected');
      }).catch((err) => {
        if (!err.response) {
          console.log(err);
          fail();
        }
        const res = err.response;
        spec('POST', '/measurement').match(res);
        expect(res.status).toEqual(404);
      });
    });
  });
});
