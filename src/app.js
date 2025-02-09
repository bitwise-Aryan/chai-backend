import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express()//() is imp
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))//is used in an Express.js application to serve static files from the "public" directory. This means that any files inside the "public" folder (such as HTML, CSS, JavaScript, images, etc.) can be accessed directly via the browser without needing explicit routes.
app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)//jaise hi koi user likhega /users hm cntrl de denge userRouter pe,ab jo bhi user.routes.js isme likhe h wo chlega

//http://localhost:8000/api/v1/users


/*
jaise hmlog local host mein krte thay waise yha nhi kr skte q ki route alg jgh h cntrller alg ek standard procedure or syntax follow krna hoga

const express = require('express');
const app = express();
const PORT = 3000; // You can change the port if needed

// Define a GET route
app.get('/', (req, res) => {
    res.send('Hello, this is your local server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
*/





export {app}