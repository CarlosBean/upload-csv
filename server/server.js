require('./config/config')
const express = require('express')
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use(require('./routes'));

// enable public folder
app.use(express.static(path.resolve(__dirname, '../public')));

// connection to DB
mongoose.connect(process.env.DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}, (err, res) => {
    if (err) throw err;
    console.log('Database online');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`)
});