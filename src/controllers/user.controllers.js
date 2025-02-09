import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser= asyncHandler(async (req,res)=>{//imp syntax
    res.status(200).json({
        message:"Aryan Singh"
    })
})



export {registerUser}