require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = process.env.JWT_SECRET_KEY;

const signUp = async(req,res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(422).send({ error: "Please enter data in all fields" });
    }
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(422).json({ msg: 'User already exists' });
        }      
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });
        await user.save();
        return res.status(200).send({ message: "Registered successfully" , user });
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error' });
    }
}

const signIn = async(req,res) => {
    const {email,password}= req.body;
    if(!email || !password){
        return res.status(422).send("please enter valid email and password");
    }
    try {
        const savedUser = await User.findOne({ email });
        if (!savedUser) {
            return res.status(404).send("User not found");
        }
        const isMatch = await bcrypt.compare(password, savedUser.password);
        if (!isMatch) {
        return res.status(401).send( "Invalid password" );
        }
        const token = jwt.sign({ _id: savedUser._id },secretKey, { expiresIn: '1h' });
        return res.status(200).send({
            message: "Login successful",
            token: token,
            employee: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
            }
        });
    } catch (error) {
      res.status(500).send( 'Internal server error' );
    }
}

module.exports = { signUp, signIn };