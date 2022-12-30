const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const inauthenticate = require('../middleware/inauthenticate');
const User = require('../models/User');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
	.post('/', inauthenticate, async (req, res, next) => {
		try {
			if (req.body.email) {
				const usedEmail = await User.getByEmail(req.body.email);
				if (!usedEmail) {
					const user = await UserService.create(req.body);
					return res.json(user);
				} else {
					const err = new Error('That email address is taken.');
					err.status = 409;
					next(err);
				}
			} else {
				const err = new Error(
					'Please include email in sign up information.'
				);
				err.status = 400;
				next(err);
			}
		} catch (e) {
			next(e);
		}
	})
	.post('/sessions', inauthenticate, async (req, res, next) => {
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
	.delete('/sessions', authenticate, (req, res) => {
		res.clearCookie(process.env.COOKIE_NAME).status(204).send();
	})
	.get('/:id', async (req, res, next) => {
		try {
			const user = await User.getById(req.params.id);
			if (user) res.json(user);
			else next();
		} catch (e) {
			next(e);
		}
	});
