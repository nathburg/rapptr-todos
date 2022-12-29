const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
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

	.get('/:id', authorize, async (req, res, next) => {
		try {
			const todo = await Todo.getById(req.params.id);
			res.json(todo);
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
	})

	.delete('/:id', authorize, async (req, res, next) => {
		try {
			const todo = await Todo.markComplete(req.params.id);
			res.json({
				message: `You completed todo ${req.params.id}.`,
			});
		} catch (e) {
			next(e);
		}
	});
