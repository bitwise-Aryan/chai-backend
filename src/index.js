
import dotenv from "dotenv"
import connectDB from "./db/index.js"//connectDb without{ } bcoz at end we used export default connectDB

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.on("error",(e)=>{//ek event ke lie listen kr rhay error
        console.log("ERRR:",e);
        throw e
        
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port: ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("mongoDb connection failed:",err);
    
})
.finally()

































// // // As early as possible in your application, import and configure dotenv:as ye env variable h to hm chahte h ki jaise hi hmari file load ho waise hi sari environment variables hr jgh load hojati h
// // //agr main life mein aagyi to bs sb jgh aajayhega
// // // config() mein path dena hota h-->>> ./env --->>>home directory ke andr hi env h

// // //2 mtd to bring dotenv when is below another one is import
// // // require('dotenv').config({path:'./env/index.js'})
// // import dotenv from "dotenv";
// // dotenv.config({ path: "./env" });

// // // import dotenv from "dotenv";//aur niche config krdo//must use experimental featurein scripts
// //  //2nd mthd mein ye sb import krne ka jrurt nhi h q ki,import { connectDb } from "./db"; isme automatically horkha h
// //  import mongoose from "mongoose";
// // import { DB_NAME } from "./constants.js";
// // // dotenv.config({
// // //     path:'./env'
// // // })

// // // 1st method//2nd mthd is at last
// // import express from "express"
// // const app=express

// // // function connectDb(){}

// // // connectDb

// // // or,use iife immediately execute fn ;(=>{})()
// //     // Immediately Invoked Async Function Expression (IIFE).

// // ;(async ()=>{
// //     //why try catch?bcoz db cnct horha h prblm hoskta h
// //     try{
// //         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 

// //     //     	app.on(...) is an event listener that listens for the "error" event.
// // 	// •	"error" is the event name that Express (or another framework) emits when an error occurs.
// // 	// •	The callback function ((error) => { ... }) executes when the event happens.


// //         app.on("error",(error)=>{//ki db agr cnct hogya mgr express ki app bat nhi kr parha,

// //             console.log("ERRR :",error);
// //             throw error
            
// //         })
// //         app.listen(process.env.PORT,()=>{
// //             console.log(`app is listening on port ${process.env.PORT}`);
            
// //         })
// //     }
// //     catch(error){
// //         console.error("ERROR :",error);
// //         throw error
        
// //     }
// // })()





// // //another approach write all fn somewhere else and import

// // // import  {connectDb}  from "./db/index.js";
// // // connectDb()




// // require('dotenv').config({path: './env'})
// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// // import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })



// connectDB()
// // .then(() => {
// //     app.listen(process.env.PORT || 8000, () => {
// //         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
// //     })
// // })
// // .catch((err) => {
// //     console.log("MONGO db connection failed !!! ", err);
// // })










// /*
// import express from "express"
// const app = express()
// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("errror", (error) => {
//             console.log("ERRR: ", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("ERROR: ", error)
//         throw err
//     }
// })()

// */
