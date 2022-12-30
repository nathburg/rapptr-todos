module.exports = async (req, res, next) => {
	try {
		if (req.cookies[process.env.COOKIE_NAME])
			throw new Error('You must sign out to continue');
		next();
	} catch (err) {
		err.status = 401;
		next(err);
	}
};
