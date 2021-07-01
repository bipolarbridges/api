## Development and Testing Info
A lot of the setup uses docker to encapsulate some of the dependencies, networking etc. Currently, there are three layers:

1. **Database**: Runs a `neo4j` instance with exposed port on localhost.
2. **Database shell**: Allows for interactive querying of the database and automated loading of fixture data using the cypher-shell software.
3. **API**: This is the application which provides HTTP endpoints to interact with the system.

### Quick-Start
1. Ensure `docker` is set up. To test the API, a `node/yarn` installation is also required.
2. Start up the database service using `yarn run db:start`. Since it might be a moment or two before it starts up, you can monitor the status using `yarn run db:status`. Once you see 'Started.' in the logs, you can escape (^C) from the status process.
3. Access the database shell using `yarn run db:shell`. If no prompt displays after a while, simply press return/enter and it should show up. Try running a query such as
    ```cypher
    MATCH (n) RETURN n;
    ```
    no nodes should be returned since the database is empty. Close the shell using the `:exit` command.
4. We can execute query-sets from the `services/db_shell/fixtures` directory by calling a script inside the database shell container. Try `yarn run db:load:example`. You should see the queries run and some statistics show up when it is complete. Try using the shell and running the match query again. You should see nodes from the example dataset. It's worth noting that the example query set used here (`services/db_shell/fixtures/example`) is a comprehensive example of our current data model. Also, since the fixtures are statically loaded when our containers are built, updating with changes to the query-sets requires `yarn run build:shell`.

### Testing the API
1. Initialize the database and the mock auth server using docker compose.
2. Build the API and the test spec file using `yarn build:api`.
3. Run the development server using `yarn api:start:test`. This will also delete what is currently in the database and replace it with fixtures for testing.
4. Since the API will be active and logging in that terminal, open another one and run `yarn test:api`.
5. When done, use `yarn stop` or `docker-compose down` to shut the db and mock auth server down.
6. Remember to escape the API service (^C).

### Testing the API the Lazy Way
1. Run `yarn api:start:all:lazy`. This will spin up the db, the mock_auth server and the api service.
    > API service will restart every time you make a change in the `.ts` files.
2. Since the API will be active and logging in that terminal, open another one and run `yarn test:api`.
3. When done, use `yarn stop` or `docker-compose down` to shut the db and mock auth server down.
4. Remember to escape the API service (^C).

### Adding Models
Models are added by using Neogma's typed ModelFactory function. To make a new model:
1. Create a model `.ts` file in the `http/api/lib/models` folder.
2. Define the properties, the related node type (with ModelRelatedNodesI type), then define the instance & neogma model by using `NeogmaInstance` and `NeogmaModel` type. 
    > Note that in order for Neogma to recognize the model, the property declared in the ModelRelatedNodeI type has to match the model's label.
3. Add it to the `models/index.ts` file and add the model to the `AllModels` type.
4. Define a init**ModelName**Model function in the **ModelName**.ts file that returns the Neogma ModelFactory value. Include the db as it requires a valid session when creating the model, and add any dependencies (models that it has relations to) as a parameter.
    > If you have a circular dependency issue (2 models rely on each other to initilialize) use the `.addRelationship({...})` method.
5. Use the init**ModelName**Model in the initAllModels function. Add it to the `this.models = {...}` value. 
