// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
// import express from "express"
// const app=express()
// //here,we must store the fn in  a variable which we can call import therefore using export yha pe iife ka mtlb nhi
// export const connectDb=async()=>{
//         try{
//             //we may store op(object) of connect in a var
//             const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)//it needs a string address,we provide from `` 
            
//             //no need of app q ki yha sirf bs db connect kr rhay
//             // app.on("error",(error)=>{
//             //     console.log("ERR:",error);
//             //     throw error
                
//             // })
//             // app.listen(process.env.PORT,()=>{
//             //     console.log(`app is listening on port ${process.env.PORT}`);
                
//             // })

//             console.log(`\n MongoDb connected !! DB host :${connectionInstance.connection.host}`);//mongoDb ka url jha cnctn horha h
            

//         }
//         catch(error){
//             console.log("ERR:",error);
//             // throw error or
//             process.exit(1)//1 is code here
            
//         }
// }

// // export default connectDb







// // Feature	export const connectDb	export default connectDb
// // Export Type	Named Export	Default Export
// // Import Syntax	{ connectDb } (Curly Braces Required)	connectDb (No Curly Braces)
// // Multiple Exports?	✅ Yes, can export multiple functions	❌ No, only one default export per file
// // Renaming While Importing?	❌ No, must use the exact function name	✅ Yes, can import with any name



import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB