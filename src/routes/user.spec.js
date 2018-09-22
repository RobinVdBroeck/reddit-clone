const sinon = require("sinon");
const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const uuid = require("uuid/v4");
const UserRepository = require("../data/user");
const createRoutes = require("./user");

describe("User routes", () => {
  let userRepository;
  let routes;
  let app;

  beforeEach(() => {
    userRepository = new UserRepository();
    routes = createRoutes(userRepository);
    app = express();
    routes.inject(app);
  });

  describe("getOne", () => {
    it("should return a 404 when none is found", done => {
      const id = uuid();

      userRepository.get = sinon.stub().returns(undefined);

      request(app)
        .get(`/user/${id}`)
        .expect(404, done);
    });
    it("should return the user when he's found", () => {
      const id = uuid();
      const user = {
        id,
        username: "robin"
      };

      userRepository.get = sinon.stub().returns(user);

      return request(app)
        .get(`/user/${id}`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.eql(user);
        });
    });
  });
});
