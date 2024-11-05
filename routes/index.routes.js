const express = require('express');
const Router = express.Router();

Router.use('/', require('./posts.routes'))
Router.use('/', require('./comments.routes'))
Router.use('/', require('./user.routes'))


module.exports = Router;