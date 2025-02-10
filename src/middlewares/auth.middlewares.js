import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"


const verifyJWT=asyncHandler(async(req,res,next)=>{//middleware mein hmesa next lgta hi lgta h ki apna kam hogya ab aage lejao
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")//get the token//cookie mein ya header mein aata h format aisa rehta h Authorization:Bearer <token>//remove Bearer(replace with empty string)//why not refreshToken?next video
        if(!token){
            throw new ApiError(401,"Unauthorised request ")
        }
        //now verify the token
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)//maybe yha bhi await lgana pdega
        //find if the user with the given token is present or not in our Db
    
        /*
            Why Do We Still Need User.findById(decodedToken?)?
    
    ✅ 1️⃣ The Token Might Be Valid, but the User Could Be Deleted
    	•	Example:
    	•	A user logs in, gets a valid JWT.
    	•	Later, the admin deletes this user from the database.
    	•	The token is still valid, but the user no longer exists.
    	•	Without checking the database, the system would allow a deleted user to access resources.
        
    
        what happens?
        	•	If the server never sets a cookie using res.cookie(), req.cookies will be undefined or empty {}.
    	•	The client cannot magically create cookies that the server never sent.
        (see user.controller.js mein hmne bheja tha res.cokkies(Accesstoken))
        
        */
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")//._id isliye q ki user models mein _id hi define kiya tha
        if(!user){
            //NEXT_VIDEO:discuss abt frontend
            throw new ApiError(401,"Invalid Access Token")
        }
    
        //ab finally etna to pta chl gya h ki user to h db mein
        req.user=user//•	req.user ka naam kuch bhi ho sakta hai, bas req object mein ek property add kar rahe hain.//Request object mein user assign kar rahe hain taki aage ke middleware ya controllers isko access kar sakein.
        next()//next() ek middleware function ko execute karne ke baad next middleware ko call karne ke liye use hota hai. Agar next() nahi lagayenge, to request wahi pe hang ho jayegi aur response client tak nahi pahunchega.
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Taken")
    }
    //ab middleware bna liya h ab chlte h routes ke pas-->fir user controller ->logout

})

export {verifyJWT}