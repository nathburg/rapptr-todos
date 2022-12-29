const { Router } = require('express');
const Todo = require('../models/Todo');

module.exports = Router()
	.get('/', async (req, res, next) => {
		try {
			const todos = await Todo.getAll(req.user.id);
			res.json(todos);
		} catch (e) {
			next(e);
		}
	})
	.post('/', async (req, res, next) => {
		try {
			if (req.body.description) {
				const todo = await Todo.insert({
					userId: req.user.id,
					...req.body,
				});
				res.json(todo);
			} else {
				const err = new Error(
					"Posted object must have a 'description' key, such as { description: 'Practice formatting requests correctly.' }."
				);
				err.status = 403;
				next(err);
			}
		} catch (e) {
			next(e);
		}
	});
