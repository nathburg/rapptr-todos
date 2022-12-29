const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const mockUser = {
	email: 'kawhi.leonard@rapptr.com',
	password: 'toronto123',
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
});
