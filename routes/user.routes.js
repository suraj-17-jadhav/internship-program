const express = require('express');
const router = express.Router();

const {signUp, signIn} = require('../controllers/user.controller');

router.post('/register' , signUp);
router.post('/login' , signIn);

module.exports = router ;