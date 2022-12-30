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

describe("todos routes", () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it("only lets authenticated users see todo routes", async () => {
    const resOne = await request(app).get("/todos");
    expect(resOne.status).toBe(401);
    const agent = await signInAndLogin();
    const resTwo = await agent.get("/todos");
    expect(resTwo.status).toBe(200);
  });

  it("posts new todo", async () => {
    const agent = await signInAndLogin();
    const resPost = await agent
      .post("/todos")
      .send({ description: "Make New Years resolution." });
    expect(resPost.status).toBe(200);
    const resGet = await agent.get("/todos");
    expect(resGet.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Make New Years resolution.",
          "id": "1",
        },
      ]
    `);
  });

  it("returns all user's uncompleted todos at GET /todos", async () => {
    const agentOne = await signInAndLogin();
    await agentOne.post("/todos").send({ description: "Clean dishes" });
    const resOne = await agentOne.get("/todos");
    expect(resOne.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Clean dishes",
          "id": "1",
        },
      ]
    `);
    await agentOne.delete("/users/sessions");
    const agentTwo = await signInAndLogin({
      email: "v.lossy@rapptr.com",
      password: "password",
    });
    await agentTwo.post("/todos").send({ description: "Eat raw meat." });
    const resTwo = await agentTwo.get("/todos");
    expect(resTwo.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Eat raw meat.",
          "id": "2",
        },
      ]
    `);
  });

  it("returns the todo with given id at GET /todos/id, if it was created by the user", async () => {
    const agentOne = await signInAndLogin();
    await agentOne.post("/todos").send({ description: "Clean dishes" });
    const resOne = await agentOne.get("/todos/1");
    expect(resOne.status).toBe(200);
    expect(resOne.body).toMatchInlineSnapshot(`
      Object {
        "description": "Clean dishes",
        "id": "1",
        "isCompleted": false,
        "userId": "1",
      }
    `);
    await agentOne.delete("/users/sessions");
    const agentTwo = await signInAndLogin({
      email: "v.lossy@rapptr.com",
      password: "password",
    });
    const resTwo = await agentTwo.get("/todos/1");
    expect(resTwo.status).toBe(403);
  });

  it("marks a todo complete (soft delete) at DELETE /todos/id", async () => {
    const agent = await signInAndLogin();
    await agent.post("/todos").send({ description: "Clean dishes" });
    await agent.delete("/todos/1");
    const res = await agent.get("/todos");
    expect(res.body).toEqual({ message: "You have no todos." });
  });

  it("edits a todo's description at PUT /todos/id", async () => {
    const agent = await signInAndLogin();
    await agent.post("/todos").send({ description: "Clean dishes" });
    await agent.put("/todos/1").send({ description: "Break dishes" });
    const res = await agent.get("/todos");
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Break dishes",
          "id": "1",
        },
      ]
    `);
  });

  it("returns all user's todos, including completed ones, at GET /todos/all", async () => {
    const agent = await signInAndLogin();
    await agent.post("/todos").send({ description: "Clean dishes" });
    await agent.post("/todos").send({ description: "Break dishes" });
    await agent.delete("/todos/1");
    const res = await agent.get("/todos/all");
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Break dishes",
          "id": "2",
          "isCompleted": false,
        },
        Object {
          "description": "Clean dishes",
          "id": "1",
          "isCompleted": true,
        },
      ]
    `);
  });
});
