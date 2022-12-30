const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const authenticate = require('./middleware/authenticate');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/users', require('./controllers/users'));
app.use('/todos', authenticate, require('./controllers/todos'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
