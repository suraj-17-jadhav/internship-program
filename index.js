require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5500;
const connectionURL = process.env.MONGO_URL;
app.use(express.json());

// mongoDB database set up
mongoose.connect(connectionURL);
mongoose.connection.on('connected', ()=>{
    console.log("Database connected successfully")
})
mongoose.connection.on('error',()=>{
    console.log("database not connected")
})

app.use('/', require('./routes/index.routes'));

// server is running on port 5500
app.listen(PORT, ()=>{
    console.log(`server is listening on ${PORT} port`)
}).on('error',(err)=>{
    console.log(`failed to start the server: ${err}`)
})

