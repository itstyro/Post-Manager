const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');

const app = express();
const mongoURl = 'mongodb://gaurav:'+ process.env.MONGO_LAB_PW + '@ds263670.mlab.com:63670/affix';
mongoose.connect(mongoURl).then(() => {
    console.log('Connected to database!');
}).catch(err => {
    console.error('Error while connecting to mongodb', err);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images',  express.static(path.join('backend/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

module.exports = app;