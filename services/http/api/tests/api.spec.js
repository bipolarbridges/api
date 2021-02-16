const jestOpenAPI = require('jest-openapi');
const path = require('path')
const axios = require('axios');
const { fail } = require('assert');

const ax = axios.create({
	baseURL: "http://127.0.0.1:8888"
});

jestOpenAPI(path.resolve(process.cwd(), "reference/bb-api.v0.yaml"));

const methods = {
    "POST": ax.post
};

function spec
(method, path) {
    return {
        match: (res) => {
            res.request['path'] = path;
            res.request['method'] = method;
            expect(res).toSatisfyApiSpec();
        }
    }
}

function match
(method, path, body, opts, status, desc = "Unspecified") {
    describe(`${method} ${path} [ ${status}: ${desc} ]`, () => {
        const _f_ = methods[method]
        if (!_f_) {
            console.log(`WARNING: invalid method specified ${method}`)
        } else {
            it("Should match API spec", async () =>
            await methods[method](`${path}`, body, opts)
            .then((res) => {
                // Should return the correct status code
                expect(res.status).toEqual(status);
                // Should respond according to the schema
                spec(method, path).match(res)
            })
            .catch((err) => {
                if (!err['response']) {
                    console.log(err)
                    fail()
                } else {
                    const res = err['response']
                    expect(res.status).toEqual(status);
                    spec(method, path).match(res);
                }
            }));
        }
      });
}


describe("Paths", () => {
    describe("/client", () => {
        match("POST", "/client",
            {
                id: "client1@email.com"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }, 201,
            "Normal happy case");
        match("POST", "/client",
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }, 400,
            "Missing data fields");
        match("POST", "/client",
            "I'm not JSON",
            {
                headers: {
                    "Authorization": "apikey1"
                }
            }, 400,
            "Invalid JSON in body");
        match("POST", "/client",
            {
                id: "client1@email.com"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey2"
                }
            }, 403,
            "Bad key");
        it("Should disallow creation of clients with the same id", 
            async () => {
                await ax.post("/client", {
                    id: "client2@email.com"
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "apikey1"
                    }
                }).then(async (res) => {
                    spec("POST", "/client").match(res)
                    expect(res.status).toEqual(201)
                    await ax.post("/client", {
                        id: "client2@email.com"
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "apikey1"
                        }
                    }).then((res) => {
                        fail("Should have rejected")
                    }).catch((err) => {
                        if (!err['response']) {
                            fail()
                        }
                        const res = err['response']
                        spec("POST", "/client").match(res)
                        expect(res.status).toEqual(403)
                        expect(res.data['message']).toEqual("Already exists")
                    })
                }).catch((err) => {
                    console.log(err)
                    fail()
                })
            })
    });
    describe("/account", () => {
        const validExampleData = {
            clientID: "5PLhmSJ8vz86eTzy",
            coachID: "w7lqCFGmq26LLCnJ"
        }
        it("Should reject if a bad key is provided", async () => {
            await ax.post("/account", validExampleData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey2"
                }
            }).then(async (res) => {
                fail("Should have rejected")
            }).catch((err) => {
                if (!err['response']) {
                    fail()
                }
                const res = err['response']
                spec("POST", "/account").match(res)
                expect(res.status).toEqual(403)
            })
        })
        const invalidData = [
            { clientId: validExampleData.clientID },
            { coachId: validExampleData.coachID },
        ]
        it("Should reject if data fields are missing", 
            async () => {
            await Promise.all(invalidData.map((dat) =>
                ax.post("/account", dat, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "apikey1" // this is a valid key
                    }
                }).then(async (res) => {
                    fail(`Should have rejected (${JSON.stringify(dat)})`)
                }).catch((err) => {
                    if (!err['response']) {
                        fail(`Error: ${err}`)
                    }
                    const res = err['response']
                    spec("POST", "/account").match(res)
                    expect(res.status).toEqual(400)
                })))
        })
        it("Should succeed for an existing client", async () => {
            await ax.post("/account", {
                clientID: "client0@email.com",
                coachID: validExampleData.coachID
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }).then(async (res) => {
                spec("POST", "/account").match(res)
                expect(res.status).toEqual(201)
            }).catch((err) => {
                console.log(err)
                fail()
            })
        })
        it("Should succeed for a non-existent client", async () => {
            await ax.post("/account", validExampleData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }).then(async (res) => {
                spec("POST", "/account").match(res)
                expect(res.status).toEqual(201)
            }).catch((err) => {
                console.log(err)
                fail()
            })
        })
    });
    describe("/measurement", () => {
        const validExampleData = {
            clientID: "client0@email.com",
            data: {
                date: 1610997441,
                dataType: 'sentiment',
                value: 0.8
            }
        }
        it("Should reject if a bad key is provided", async () => {
            await ax.post("/measurement", validExampleData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey2"
                }
            }).then(async (res) => {
                fail("Should have rejected")
            }).catch((err) => {
                if (!err['response']) {
                    fail()
                }
                const res = err['response']
                spec("POST", "/measurement").match(res)
                expect(res.status).toEqual(403)
            })
        })
        const invalidData = [
            // Missing fields
            {
                data: {
                    date: 1610997441,
                    dataType: 'sentiment',
                    value: 0.8
                }
            },
            {
                clientID: "client2@email.com"
            },
            {
                clientID: "client2@email.com",
                data: {
                    dataType: 'sentiment',
                    value: 0.8
                }
            },
            {
                clientID: "client2@email.com",
                data: {
                    date: 1610997441,
                    value: 0.8
                }
            },
            {
                clientID: "client2@email.com",
                data: {
                    date: 1610997441,
                    dataType: 'sentiment'
                }
            },
            // Bad typing examples
            {
                clientID: "client0@email.com",
                data: {
                    date: 'Jun 1st',
                    dataType: 'sentiment',
                    value: 0.8
                }
            }
        ]
        it("Should reject if data fields are missing or have wrong type", 
            async () => {
            await Promise.all(invalidData.map((dat) =>
                ax.post("/measurement", dat, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "apikey1"
                    }
                }).then(async (res) => {
                    fail(`Should have rejected (${JSON.stringify(dat)})`)
                }).catch((err) => {
                    if (!err['response']) {
                        fail(`Error: ${err}`)
                    }
                    const res = err['response']
                    spec("POST", "/measurement").match(res)
                    expect(res.status).toEqual(400)
                })))
        })
        it("Should respond properly upon success", async () => {
            await ax.post("/measurement", validExampleData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }).then(async (res) => {
                spec("POST", "/measurement").match(res)
                expect(res.status).toEqual(201)
            }).catch((err) => {
                console.log(err)
                fail()
            })
        })
        it("Should reject if client does not exist", async () => {
            await ax.post("/measurement", {
                clientID: "doesnotexist@email.com",
                data: validExampleData.data
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "apikey1"
                }
            }).then(async (res) => {
                fail("Should have rejected")
            }).catch((err) => {
                if (!err['response']) {
                    fail()
                }
                const res = err['response']
                spec("POST", "/measurement").match(res)
                expect(res.status).toEqual(404)
            })
        })
    });
});