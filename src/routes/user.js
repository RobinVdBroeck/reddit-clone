/**
 *
 * @param {*} User User data layer access object
 * @param {*} App App object
 */
function createUserRoutes(User, app) {
  app.get("/user/:uuid", async (req, res) => {
    const { params } = req;
    const uuid = params.uuid || "d9ab4715-3cef-4d4b-92e6-a90a1d91f41f";

    try {
      const user = await User.get(uuid);
      if (typeof user === "undefined") {
        res.status(404);
      }
      res.json(user);
    } catch (e) {
      console.error(`Error while getting user with uuid ${uuid}`, e);
      res.status(500);
    }
  });

  app.get("/users", async (req, res) => {
    const allUsers = await User.all();
    res.render("user/index", {
      users: allUsers
    });
  });

  app.post("/user", async (req, res) => {
    const user = req.body;
    const uuid = await User.create(user);
    res.json({
      ...user,
      uuid
    });
  });
}

module.exports = createUserRoutes;
