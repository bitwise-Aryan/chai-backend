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
export {app}