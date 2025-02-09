import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";//for error handling
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
        const exsistedUser=User.findOne({
            $or:[{username},{email}]
        })

        if(exsistedUser){
            throw new ApiError(409,"User with email or username already exist")
        }

        //multer given features
        const avatarLocalPath=req.files?.avatar[0]?.path;
        const coverImageLocalPath=req.files?.coverImage[0]?.path;//ye local paths ho bhi skte h nhi bhi

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



export {registerUser}