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
		...mockUser,
	});

	return agent;
};

describe('todos routes', () => {
	beforeEach(() => {
		return setup(pool);
	});
	afterAll(() => {
		pool.end();
	});

	it('only lets authenticated users see todo routes', async () => {
		const resOne = await request(app).get('/todos');
		expect(resOne.status).toBe(401);
		const agent = await signInAndLogin();
		const resTwo = await agent.get('/todos');
		expect(resTwo.status).toBe(200);
	});
});
