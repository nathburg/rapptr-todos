const { Router } = require('express');
const User = require('../models/User');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
	.post('/', async (req, res, next) => {
		try {
			const user = await UserService.create(req.body);
			res.json(user);
		} catch (e) {
			next(e);
		}
	})
	.post('/sessions', async (req, res, next) => {
		try {
			const token = await UserService.signIn(req.body);
			res.cookie(process.env.COOKIE_NAME, token, {
				httpOnly: true,
				secure: process.env.SECURE_COOKIES === 'true',
				sameSite:
					process.env.SECURE_COOKIES === 'true' ? 'none' : 'strict',
				maxAge: ONE_DAY_IN_MS,
			}).json({ message: "You're signed in!" });
		} catch (e) {
			next(e);
		}
	})
	.delete('/sessions', (req, res) => {
		res.clearCookie(process.env.COOKIE_NAME, {
			httpOnly: true,
			secure: process.env.SECURE_COOKIES === 'true',
			sameSite: process.env.SECURE_COOKIES === 'true' ? 'none' : 'strict',
			maxAge: ONE_DAY_IN_MS,
		})
			.status(204)
			.send();
	});
