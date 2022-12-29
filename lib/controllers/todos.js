const { Router } = require('express');
const Todo = require('../models/Todo');

module.exports = Router().get('/', async (req, res, next) => {
	try {
		console.log('req.body ', req.user.id);
		const todos = await Todo.getAll(req.user.id);
		console.log('todos ', todos);
		res.json(todos);
	} catch (e) {
		next(e);
	}
});
