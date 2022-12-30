const pool = require("../lib/utils/pool");
const setup = require("../data/setup");
const request = require("supertest");
const app = require("../lib/app");

const mockUser = {
  email: "kawhi.leonard@rapptr.com",
  password: "toronto123",
};

const signInAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  const user = await request(app)
    .post("/users")
    .send({ ...mockUser, ...userProps });
  const agent = request.agent(app);
  await agent.post("/users/sessions").send({
    ...mockUser,
    ...userProps,
  });
  const { email } = user;
  await agent.post("/users/sessions").send({ email, password });

  return agent;
};

describe("user routes", () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it("creates a new user", async () => {
    const res = await request(app).post("/users").send(mockUser);
    const { email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      email,
    });
  });

  it("logs in a user", async () => {
    await request(app).post("/users").send(mockUser);
    const res = await request(app).post("/users/sessions").send({
      email: "kawhi.leonard@rapptr.com",
      password: "toronto123",
    });
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ message: "You're signed in!" });
  });

  it("signs user out at DELETE /sessions", async () => {
    const agent = await signInAndLogin();
    const loggedInRes = await agent.delete("/users/sessions");
    expect(loggedInRes.status).toBe(204);
    const loggedOutRes = await agent.delete("/users/sessions");
    expect(loggedOutRes.status).toBe(401);
  });

  it("returns user email by id at GET /users/id", async () => {
    await request(app)
      .post("/users")
      .send({ ...mockUser });
    await request(app)
      .post("/users")
      .send({ email: "mock@user.com", password: "password" });
    const resOne = await request(app).get("/users/1");
    expect(resOne.body).toMatchInlineSnapshot(`
      Object {
        "email": "kawhi.leonard@rapptr.com",
        "id": "1",
      }
    `);
    const resTwo = await request(app).get("/users/2");
    expect(resTwo.body).toMatchInlineSnapshot(`
      Object {
        "email": "mock@user.com",
        "id": "2",
      }
    `);
  });
});
