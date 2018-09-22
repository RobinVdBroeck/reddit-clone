/**
 *
 * @param {*} UserRepository User data layer access object
 */
module.exports = UserRepository => ({
  /**
   * Inject the routes into the app object
   * @param {} app Express app object
   */
  inject(app) {
    app.get("/user/:uuid", this.getOne);
    app.post("/user", this.createOne);
    app.get("/users", this.getAll);
  },

  async getAll(req, res) {
    const allUsers = await UserRepository.all();
    res.render("user/index", {
      users: allUsers
    });
  },
  async getOne(req, res) {
    const { params } = req;
    const uuid = params.uuid || "d9ab4715-3cef-4d4b-92e6-a90a1d91f41f";

    try {
      const user = await UserRepository.get(uuid);
      if (typeof user === "undefined") {
        res.status(404);
      }
      res.json(user);
    } catch (e) {
      console.error(`Error while getting user with uuid ${uuid}`, e);
      res.status(500);
    }
  },
  async createOne(req, res) {
    const user = req.body;
    const uuid = await UserRepository.create(user);
    res.json({
      ...user,
      uuid
    });
  }
});
