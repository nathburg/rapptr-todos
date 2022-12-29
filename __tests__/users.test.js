const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const mockUser = {
	email: 'kawhi.leonard@rapptr.com',
	password: 'toronto123',
};

const signInAndLogin = async () => {
	await request(app).post('/users').send(mockUser);
	const agent = request.agent(app);
	await agent.post('/users/sessions').send({
		email: 'kawhi.leonard@rapptr.com',
		password: 'toronto123',
	});

	return agent;
};

describe('user routes', () => {
	beforeEach(() => {
		return setup(pool);
	});
	afterAll(() => {
		pool.end();
	});

	it('creates a new user', async () => {
		const res = await request(app).post('/users').send(mockUser);
		const { email } = mockUser;

		expect(res.body).toEqual({
			id: expect.any(String),
			email,
		});
	});

	it('logs in a user', async () => {
		await request(app).post('/users').send(mockUser);
		const res = await request(app).post('/users/sessions').send({
			email: 'kawhi.leonard@rapptr.com',
			password: 'toronto123',
		});
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({ message: "You're signed in!" });
	});

	it('signs user out at DELETE /sessions', async () => {
		const agent = await signInAndLogin();
		const signOutRes = await agent.delete('/users/sessions');
		expect(signOutRes.status).toBe(204);
	});
});
