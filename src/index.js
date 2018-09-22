const express = require("express");
const Knex = require("knex");
const Redis = require("ioredis");
const path = require("path");
const bodyParser = require("body-parser");
const UserRepository = require("./data/user");

const config = {
  http: {
    port: 80
  },
  database: {
    host: "db",
    username: "reddit-clone",
    password: "super-duper-secret",
    database: "reddit-clone",
    maxAmountOfTries: 5, // Amount of tries to connect with the database
    timeout: 1000 // Timeout between attempts to connect with the database
  }
};

let tries = 0;
/**
 * Tries to connect with the database. If a connection not can be made, it waits for a set amount
 * of time set in the config.
 *
 * This function cannot be called multiple times if one one the calls has not succeeded (because of
 * the globals tate of the tries variable)
 */
function connectionLoop() {
  const {
    host,
    username,
    password,
    database,
    maxAmountOfTries,
    timeout
  } = config.database;
  return new Promise((resolve, reject) => {
    try {
      console.log(
        `Testing connection with database (attempt: ${tries +
          1}/${maxAmountOfTries})`
      );
      const knex = Knex({
        client: "pg",
        connection: {
          user: username,
          host,
          password,
          database
        }
      });
      console.log("Got connection with database");
      tries = 0;
      resolve(knex);
    } catch (e) {
      console.error("Could not get connection", e);
      tries += 1;
      if (tries === maxAmountOfTries) {
        reject(new Error("Could not get connection"));
        tries = 0;
      }
      timeout(connectionLoop, 1000);
    }
  });
}

async function setupDatabase() {
  console.log("Setting up the database");

  const knex = await connectionLoop();

  return knex;
}

async function setupRedis() {
  console.log("Setting up redis");
  const redis = new Redis({
    host: "redis"
  });
  return redis;
}

Promise.all([setupDatabase(), setupRedis()])
  .then(async ([knex, redis]) => {
    /* eslint-disable global-require */
    console.log("Setting up the models");
    const userRepository = new UserRepository(knex, redis);
    await userRepository.setup();

    console.log("Setting up express");
    const app = express();
    app.use(bodyParser.json());
    app.use(express.static(path.resolve(__dirname, "../static")));
    app.set("views", path.resolve(__dirname, "../views"));
    app.set("view engine", "pug");

    console.log("Setting up the routes");
    const userRoutes = require("./routes/user")(userRepository);
    userRoutes.inject(app);

    app.listen(config.http.port, () => {
      console.log(`Listening on port ${config.http.port}`);
    });
    /* eslint-enable global-require */
  })
  .catch(console.error);
