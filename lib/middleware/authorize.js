const Todo = require('../models/Todo');

module.exports = async (req, res, next) => {
	try {
		const todo = await Todo.getById(req.params.id);
		if (todo && todo.userId === req.user.id) {
			next();
		} else throw new Error('You do not have access to this todo.');
	} catch (e) {
		e.status = 403;
		next(e);
	}
};
