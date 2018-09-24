const uuid = require("uuid/v4");

module.exports = class UserRepository {
  /**
   * @param {*} knex The knex instance
   * @param {*} redis The redis instance
   */
  constructor(knex, redis) {
    this.knex = knex;
    this.redis = redis;
    this.tableName = "users";
    this.allRedisKey = "all-users";
  }

  /**
   * Create the tables
   * @returns {void}
   */
  async setup() {
    const { knex, tableName } = this;
    const tableExists = await knex.schema.hasTable(tableName);
    if (!tableExists) {
      console.log(`Creating table for users with name ${tableName}`);
      await knex.schema.createTable(tableName, table => {
        table.string("id").primary();
        table.string("email").unique();
        table.string("username").unique();
      });
    }
  }

  /**
   * Get an array of all the users
   */
  async all() {
    const { knex, redis, tableName, allRedisKey } = this;

    const cachedValues = await redis.get(allRedisKey);
    if (cachedValues !== null) {
      return JSON.parse(cachedValues);
    }

    const result = await knex.from(tableName).select("*");
    redis.set(allRedisKey, JSON.stringify(result));
    // No reason to wait for it to be cached, we can allready return it
    return result;
  }

  /**
   *
   * @param {string} id  Id of the given user
   */
  async get(id) {
    const { redis, knex, tableName } = this;

    const cachedUser = await redis.get(id);
    if (cachedUser !== null) {
      return JSON.parse(cachedUser);
    }
    const result = await knex
      .from(tableName)
      .select("*")
      .where({
        id
      });

    if (result.length === 0) {
      return undefined;
    }

    redis
      .set(id, JSON.stringify(result[0]))
      .then(() => console.log(`Inserted user with uuid  ${id} in redis`))
      .catch(e =>
        console.error(`Could not set user with uuid ${id} in redis`, e)
      );

    return result[0];
  }

  /**
   *
   * @param {object} user User to be inserted
   * @returns {string} uuid of the newly created user
   */
  async create(user) {
    const { knex, redis, tableName, allRedisKey } = this;

    // todo: fix constraints
    const result = await knex(tableName)
      .returning("uuid")
      .insert({
        ...user,
        id: uuid()
      });

    redis.del(allRedisKey);
    return result[0];
  }
};
