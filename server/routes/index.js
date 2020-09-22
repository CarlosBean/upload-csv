const express = require('express');
const app = express();

app.use(require('./user'));
app.use(require('./customer'));
app.use(require('./campaign'));
app.use(require('./login'));
app.use(require('./upload'));

module.exports = app;