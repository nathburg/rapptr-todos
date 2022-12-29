const pool = require('../utils/pool');

module.exports = class Todo {
	id;
	userId;
	description;
	isCompleted;

	constructor(row) {
		this.id = row.id;
		this.userId = row.user_id;
		this.description = row.description;
		this.isCompleted = row.is_completed;
	}

	static async getAll(uid) {
		const { rows } = await pool.query(
			`
            SELECT *
            FROM todos
            WHERE user_id = $1
            AND is_completed = $2
            `,
			[uid, 'false']
		);
		if (rows.length > 0) return rows.map((row) => new Todo(row));
		else return { message: 'You have no todos.' };
	}

	static async getById(todoId) {
		const { rows } = await pool.query(
			`
            SELECT *
            FROM todos
            WHERE id = $1
            `,
			[todoId]
		);
		if (rows.length > 0) return new Todo(rows[0]);
		else return null;
	}

	static async insert({ userId, description }) {
		const { rows } = await pool.query(
			`
            INSERT INTO todos (user_id, description)
            VALUES ($1, $2)
            RETURNING *
            `,
			[userId, description]
		);
		return new Todo(rows[0]);
	}
};
