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
            `,
			[uid]
		);
		if (rows.length > 0) return rows.map((row) => new Todo(row));
		else return [];
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

	static async markComplete(todoId) {
		const { rows } = await pool.query(
			`
            UPDATE todos
            SET is_completed = $1
            WHERE id = $2
            RETURNING *
            `,
			['true', todoId]
		);
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

	static async edit({ id, description }) {
		const { rows } = await pool.query(
			`
            UPDATE todos
            SET description = $1
            WHERE id = $2
            RETURNING *
            `,
			[description, id]
		);
		return new Todo(rows[0]);
	}
};
