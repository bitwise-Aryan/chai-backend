import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";//for error handling
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
// import cookieParser from "cookie-parser";

const generateAccessAndRefreshToken=async (userId)=>{
    try {
        const user=await User.findById(userId)//ek instance le liya db se ab isme mthds use honge
        const accessToken=user.generateAccessToken()//these r mthds must use ()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken//see notes accesstoken nxt pg
        await user.save({validateBeforeSave:false})

        //refresh token Db mein successfully phucha diya

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while creating access and refresh token")
    }
}
const registerUser= asyncHandler(async (req,res)=>{//imp syntax
    /*res.status(200).json({
        message:"Aryan Singh"
    })*/

        //get user details from frontend-ye depend krega hmne kaisa userModel bnaya h
        //validation eg:not empty
        //check if user already exist(for eg:we can check from ki dekho email unique h ki nhi)
        //check for images,check for avatar
        //if available upload them to cloudinary
        //agaian check avatar is uploaded or not//as avatar is a required file
        //cloudinary ka code dekho usme hme ek response milta h use hm url extract kr skte h
        //Flow (Node.js --> Multer --> Cloudinary --> MongoDB)

        // 1.	User uploads an image →
        // 2.	Multer processes it & sends it to Cloudinary →
        // 3.	Cloudinary returns a URL →
        // 4.	We save only the URL in the database

        //Cloudinary returns a URL →ab hme,ek user object bnanaa pdega
        //create user object->create entry in db(.create)
        //remove password and refresh token field from response // Security Concern: Never expose sensitive data in API responses.
        //check for user creation
        //return response through API to frontend

        const{fullName,email,username,password}=req.body//req.body ke andr data aarha h,1st step done(get user details from frontend)
        console.log("email:",email);

        //we can handle errors like this that is ek ek karke
        // if(fullName===""){
        //     throw new ApiError(400,"fullname is required")
        // }

        if([fullName,email,username,password].some((field)=>field?.trim()==="")){
            throw new ApiError(400,"All fields are required")//	trim is a method in JavaScript that removes whitespace from both ends of a string.
        }

        //more eg will be ki jaise email mein @ h ki nhi
        //if (!email.includes("@")) {
        // throw new Error("Invalid email: '@' is missing");


        //check if user already exist or not?
        const exsistedUser=await User.findOne({//debug:missed await//error in postman:Error: User with email or username already exis
            $or:[{username},{email}]
        })

        if(exsistedUser){
            throw new ApiError(409,"User with email or username already exist")
        }

        console.log(req.files);
        
        //multer given features
        const avatarLocalPath=req.files?.avatar[0]?.path;
        // const coverImageLocalPath=req.files?.coverImage[0]?.path;//ye local paths ho bhi skte h nhi bhi
        //this syntax doent handle cases when we send no cover image as avatar is bein explicitly being checked but this not-->>so it may give error
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath=req.files.coverImage[0].path
        }
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
        }

        //ab cloudinary wale mthd jo  hm bnae rkhe thay usme code dekho localfilepath hi derhay thay wo cloudinary mein upload krdega aur response return krdega,jise response.url extract krlenge
        //note:abhi tk success ke bad cloudinary wale cloud mein unsync nhi kiya h i.e. remove from localServer only remove kr rhay jb unsuccesfull horha
        //mgr ek bar cloudinarry pe upoad hojaega tb hta denge

        const avatar=await uploadonCloudinary(avatarLocalPath)//already upr dekho async await ka use kr rhay mgr,ye kam jbtk nhi horha tbtk to bilkul nhi jana

        const coverImage=await uploadonCloudinary(coverImageLocalPath)

        if(!avatar){////as avatar is a required file
            throw new ApiError(400,"Avatar file is required")
        }


        //Cloudinary returns a URL →ab hme,ek user object bnanaa pdega
        //create user object->create entry in db(.create)
        //yha user directly model h mongoose ka whi direct bat kr rha h Db se

        const user=await User.create({
            fullName,//we may use fullName:fullName but since we r not modifying it can be done like this
            avatar:avatar.url,//sirf url submit krenge Db mein
            coverImage:coverImage?.url || "",//since coberImage is not a required file therefore,we must check ki wo exist krta h bhi ki nhi Db meinndalne se pehle
            email,
            password,
            username:username.toLowerCase()
            //remember currently we have not added watchHistory usko jaise jaise user video dekhega waise waise add krenge
        })

        //now we must check ki MongoDb mein ye sb gya bhi h ki nhi
        //as earlier told User(capital u) was created using MongoDb and has power to directly interact with dataBase,therefore,we will use the fact thaat every time something is entered in mongoDb it gives a id
        const createdUser=await User.findById(user._id).select("-password -refreshToken")
        //note: select ka syntax hota h string mein -jo nhi chahiye q ki automatically sbkch select hi rehta h
        //hn bar bar db call horha,optimisation bad mein dekhenge

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user")
        }
        //Yes! This processed user object (without password and refreshToken) will be sent to the frontend via an API response. isliye hta diya psswd aur refresh token exposed nhi rehna chahiye ye sb mein

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered Successfully")//ApiResp ka code dekho 2nd argument h data ka wo hmlog yha se dal diye
        )
})

const loginUser=asyncHandler(async (req,res)=>{
    //req body se data le aao destructure krke
    //username,email,password,is psswd crct,accesstoken,refreshtoken

    //req body->data
    //username or email
    //find the user
    //psswd check
    //access and refresh token generation and send it to user in secured cookies
    //send response successfully login hogya

    const{username,email,password}=req.body
    // if(username==="" || !email){//we may decide acc to our requirments ki username chahiye ya email as login
    //     throw new ApiError(400,"Username or email is required")
    // }
    //above is wrong syntax it should be//pr if(!username && !email)
    if(!(username || email)){//we may decide acc to our requirments ki username chahiye ya email as login
        throw new ApiError(400,"Username or email is required")
    }

    //find that if they already exist or not,finding one is simple,see below

    // const existedUser=User.findOne({username})
    //advance syntax same we use in registerUser also

    const user=await User.findOne(//database se wps liya h ye user ek instance is user pe ispsswdcrct ye sb use krskte h
        {
            $or:[{username},{email}]
        }
    )
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    //is psswd crct jo hmne bnaya tha user.models ka code dekho//async function(password)//isme password mein jo user ne abhi diya h wo dalna h q ki database mein jo save h wo this.password se milega
    //note:to use ispsswdcrct we use user (small u) see line 135,small user ke pas ye sb mthd h User ke pas mongoose ke mthd h

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }

    //since we have to check access and refresh token frequently we r creating a mthd before hand see code line 7

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)//db related opern await

    //send cookies,user ko kya kya info bhejni h

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={//why this step?by default anybody can modify our cookies in frontend,mge jaise hi httpOnlu:true,secure:true kr dete h to ye cookies sirf server se modify hoskte h,frontend se nhi dikhega mgr modify nhi hoga
        httpOnly:true,
        secure:true
    }

    //we can use .cookie bcz we have injected cookie_parser before .cookie().cookie() can be used like this
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)//here ("key",value,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,//status code
            {//data
                //user ke andr kya kya bhejna chahte h
                user:loggedInUser,accessToken,refreshToken//not a good prctc to send refreshToken but we r handling the case when user want to himself ssave access and refresh token,for eg:developing mobile application where cookies r not there// “It’s generally not a good practice to send the refreshToken, but we are handling cases where users may want to store both tokens (e.g., for mobile apps where cookies are unavailable).
            },
            "User logged in successfully"//message
        )
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
    //cookies wgera hta do,q ki ye server se hi maintain ho skti h(options ke wjh se)
    //yha hmlog user ko db mein select kaise kre?q ki upr to user entry derha tha fir//const{username,email,password}=req.body-->>”//await User.findOne ye sb kr rhay thay
    //mgr logOut ke sme bhi same ek form de user ko bhrne ke lie tb to wo kisiko bhi logout kr dega


    //q ki routes mein pehle verifyJWT chla tha isliye hmare pas req.user property h see code and notes
    //ab req.user se user id le lenge q ki isme user ko hi store kiya tha
    
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={//why this step?by default anybody can modify our cookies in frontend,mge jaise hi httpOnlu:true,secure:true kr dete h to ye cookies sirf server se modify hoskte h,frontend se nhi dikhega mgr modify nhi hoga
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))//2nd argument is empty bcoz we dont need to send data this time

})

const refreshAccessToken=asyncHandler(async(req,res)=>{

    //iske lie hme sbse pehle refreshToken chchaiye q ki usi ko Db mein match krenge

    //meaning smjho: req.cookies.refreshToken(request mein cookies bhej rha jisme refreshToken hoga) aur agr koi mobileApp se dekh rha to body mein bhejega
    const incomingRefreshtoken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshtoken){
        throw new ApiError(401,"unauthorised request")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
        //decoded token has refreshToken
        //also if we see how we created refreshToken in user.models we will see that we r storing only _id therefore we can access id by this refresh token
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        //note jb hmne generate and refresh token krwaya tha see code line 9,tb hmne wo generate huwa refresh token user(small u) mein save kiya tha// agr us user aur incoming refreshtoken dono ka same refrestoken huwa to dono same h as dono same userid se bna h
        const orignalRefreshToken=user?.refreshToken
        if(orignalRefreshToken!==incomingRefreshtoken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        //yha tk phuch gye h to//generate fresh generateAccessAndRefreshToken
    
        const options={
            httpOnly:true,
            secure:true
        }
        
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refreshToken")
    }


})



export {
    
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}