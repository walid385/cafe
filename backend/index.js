const express = require('express');
const cors = require('cors');
const conn = require('./connection');
require('dotenv').config();
const userRoute = require('./routes/user');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoute);



module.exports = app;
