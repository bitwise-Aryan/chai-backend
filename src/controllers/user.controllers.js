import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";//for error handling
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
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


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,confirmPassword}=req.body//sbse pehle hmne le liya ki hme request se kya kya chahiye
    //waise to newPassword===confirmPassword ye frontend mein hi hojata h//mgr koi na yha bhi krlenge
    if(newPassword!=confirmPassword){
        throw new ApiError(401,"newPassword & confirmPassword should be same")
    }
    const user=await User.findById(req.user?._id)//simce authmiddleware chla h,usme hmne req mein user property add krdia tha after removing psswd and refreshToken
    // const password=user.password  // ye hme password nhi deskta q ki ye hmne hta diya tha const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)//myhd bnaya tha user.models mein login user mein bhi use huwa h
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid oldPassword")
    }

    user.password=newPassword
    //usr.models mein save wala apart chlega q ki !this.password wala chelga,agr modification nhi h to return krdo nhi to bcrypt krDo hash wash hojaega apna
    await user.save({validateBeforeSave:false})//since ye sare db  related h

    return  res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))

    

})


const getCurrentUser=asyncHandler(async(req,res)=>{
    //firse whi bat jb hmne auth likha tha verifyJWT tb req.user mein pura user dal diya tha
    //In user.routes.js, we first pass the authentication middleware (auth or verifyJWT), then execute getCurrentUser.
    //wha se verify hojata h ki user loggedIn h ya nhi
     return res.status(200).json(new ApiResponse(200,req.user,"Current User fetched Successfully"))
})

//it depends on the backeEnd developer what are the things they allow to change,for eg utube doesnt give us permission to change our username

//note data update krna h to ye mthd use kro,mgr its a good practice that if we want to update file wgera to unka alg sa mthd bna lo for eg:profile photo update krwana h to whi option dedo update ka
const updateAccountDetails=asyncHandler(async(req,res)=>{
    //ise pehle verifyJWT to dalenge hi h ki shi user logged in h ya nhi,to req.user mein user aajayega np
    const{fullName,email}=req.body
    if(!(fullName || email)){//both r empty
        throw new ApiError(401,"Both fullName and email cannot be empty")
    }

    /* 
        one way to save:

        const user=req.user
        if(fullName)user.fullName=fullName
        if(email)user.email=email//imp to ensure ,if(email)
        await user.save();


        // •	.save() is explicitly called to save the document.
	// •	The pre-save hook runs automatically to modify the password before saving.
    //the save return in pre save is always runed before .save() if password is modified it encrypts the new password
    //else dont

    */
    const user=await User.findByIdAndUpdate(
        req.user?._id,
            {
                $set:{
                    fullName:fullName,
                    email
                }
            }
        ,
        {new:true}//new ke wjh se update hone ke bad wali information return hoti h isliye save kra
    ).select("-password")

    return  res
    .status(200)
    .json(
            new ApiResponse(200,user,"Account updated Successfully")
    )

})


//if we update files?see notes and learn abt avatar(field name,can be given any name not necessarily avatar)

const updateUserAvatar=asyncHandler(async(req,res)=>{//ise pehle bhi verifyJwt,to req.user mein to aahigya h id
    const avatarLocalPath=req.file?.path;//note yha pe .file use krhay not .files as yha pe sirf AvatarLocalPath ka bat horha bs upr coverImages ka bhi horha tha
    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar file is needed")
    }

    const avatar=await uploadonCloudinary(avatarLocalPath)

    if(!avatar.url){//agr cloudinary url nhi diya to
        throw new ApiError(401,"Error while uploading on avatar")
    }

    /*

🔹 Difference Between req.file and req.files,ye sb routes mein apun add kr denge to add multer middleware,we will use upload
Upload Type         	                                Multer Method	                                                    Property Added
Single File	                                            upload.single('fieldname')	                                        req.file (Object)
Multiple Files (Same Field)	                            upload.array('fieldname', maxCount)	                                req.files (Array)
Multiple Files (Different Fields)	                    upload.fields([{ name: 'field1' }, { name: 'field2' }])	            req.files (Object with arrays)
    
    
    */


    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url//hme jo mila h wo avatar ek pura obj mila h mgr hme model mein sirf url save krna h
            }
        }
    ).select("-password")

    /*
    //another way
    // const user = await User.findById(req.user._id);
    // if (!user) {
    //     throw new ApiError(404, "User not found");
    // }

    // // Update the avatar field
    // user.avatar = avatar;

    // // Save the changes
    // await user.save();
    */


    return res
    .status(200)
    .json(
        new ApiResponse(201,user,"Successfully updated User Avatar")
    )

})


//for coverImage

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Invalid coverImage path")
    }

    const updatedCoverImage=await uploadonCloudinary(coverImageLocalPath)
    if(!updatedCoverImage.url){
        throw new ApiError(400,"Something went wrong on updating coverImage on cloudinary")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        { 
            $set:{
                coverImage:updatedCoverImage.url//bcoz cloudinary hme object deta h
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"successfully updated coverImage")
    )
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const{username}=req.params//url se username exteact krlia
    //check username h bhi ki nhi url mein
    if(!username?.trim()){//trim leading aur ending spaces ko hta deta h
        throw new ApiError(400,"Username is missing")
    }
    //we can do like this but niche dekho
    // User.find({username})//	•	username is a string extracted from req.params, not an Object ID.//•	If you were using findById(), it wouldn’t work // we dont need findone as username is unique//firstone return first occurence in db
	
    //const channel se hmne filter krliya h ek document,niche wale mthd se
    const channel=await User.aggregate([//User.aggregate jo bhi field add krenge user mein jaega,local id hmesa User ka hi hoga
        {
            $match:{
                username:username?.toLowerCase()//sare ek username walo ka document bn gya//for eg:chai aur code jiska jiska username h wo bn gya
            }
        },
        {//no of subscriber
            $lookup:{
                from:"subscriptions",//in MongoDb lowerCase aur plural hokr store hote h models
                localField:"_id",
                foreignField:"channel",//channel ko select kr lenge ie chai aur code ketne doc mein channel h,we will get no of subscriber  
                as:"subscribers"
            }
        },
        {//no to which this channel/user has subscribed

            //must read point to note
            //point to note:in subscription model in subscriber field we will have userid of who has subscribed that particular channel by matching the id of users to documents in which subscriber has same id that of user we can filter out the no of channels whose subscriber is the given channel while in case to find no of subscriber we have to match the id with channels(note id of user will be used as channel id in diff document therefore matching the user id with channe id will give us no of subscriber and matching user id with subscriber will give us no of subscribed)
            $lookup:{
                from:"subscriptions",//in MongoDb lowerCase aur plural hokr store hote h models
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriberdTo"
            }
        },
        {//now we have to add these fields
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"//user dollar q ki subscribers ab ek field h//ye line 488 wala subscribers h
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{//subscribe button subscribed mein change backend se true false frontend wala smbhalega
                    $cond:{//cond mein usually teen param hote h,if then else

                        //hme dekhna h ki jo document subscribers hmare pas aaya h usme mein hun ya nhi
                        //operator:$in ye hme array or object dono mein khoj kr de deta h
                        //agr hm loggedIn honge to hmare pas req.user property hogi
                        //to dekho lo wo subscribers mein h ya nhi ab q ki subscribers ek field h therefore dollar sign
                        //$subscribers.subscriber,bcz user .model  mein wo subscriber hi to h
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {//last pipeline:project it will give the desired values to frontend//sari values dene ki jrurt nhi hoti befaltu ka size bdhta h dat aka
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
                //if we want to give when was channel created give created at also
            }
        }
    ])




            //see what we will get op?we wil get op like [{}],ie array ke andr ek hi object hoga as we have matched with user aur db mein sirf ek hi ka nam user h
        //op aisa bhi hoskta h [{},{},{}......]

        if(!channel?.length){
            throw new ApiError(404,"Channel does not exist")
        }

        //we may return array as getUserChProfile(channel jo andr def  huwa h) mein hme ye milega [{user:,}]
        //mgr q ki hme sirf ek hi obj mila h usme to frontend walo ka kam asan krne ke lie just return that obj

        return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"User Channel fetched successfully")
        )

})


//in nxt video history
//nested lookups
const getWatchHistory=asyncHandler(async(req,res)=>{
    //interview part ,req.user._id-->>mein hme mangoDb user mein dekho ek string hota h,wo actual mongoDb id nhi h uske lie hme ObjectId('wo string'),ab q ki hmlog mongoose ka use kr rhay isliye wo ye sb kam hmare lie behind the back kr deta h
    //req.user._id ek string milta h
    //aggregation pipleine ke sare code mein mongoose wo kam nhi kr pata h isliye hme hi convert krna pdega
    
    const user=await User.aggregate([
        {
            // The given aggregation pipeline filters the User collection and returns the document(s) where the _id matches req.user._id.
            // in most cases, user will contain only one user document in an array because _id is unique in MongoDB (it’s the primary key)
            $match:{//ye match krne ke bad hme user model milgya h 
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            //now we have to lookup inside its watchHistory


            /*
                key points must read?akhir kya hota h ObjectId ke andr array mein hmesa videoId store hota rehta h

                Key Points
                    1.	Before $lookup
                    •	The watchHistory in the users collection only stores video _ids.
                    •	No actual video details are stored in the users collection.
                    2.	During $lookup Execution
                    •	MongoDB matches the _ids from videos with watchHistory dynamically.
                    •	The result includes full video details, but only in the query output, not in the database.
                    3.	After Query Execution
                    •	The data is not permanently stored in the users collection.
                    •	If you run the query again, MongoDB will recompute the $lookup results.
                    •	To store the joined data permanently, you would need to save the query output into another collection using $out or $merge.
            
            
            Since _id is always present in MongoDB collections, your $lookup uses it as the primary key when matching documents.
            id hmne users mein bhi nhi bnaya h model dekho
            _id hmesa MongoDb:MongoDB automatically assigns _id to every document, even if you don’t define it in the schema.
            */
            $lookup:{
                form:"videos",//kha se jorne ka material lae
                localField:"watchHistory",//// Field in users collection (Array of ObjectIds)//kha pe jorna h user ke andr
                foreignField:"_id",// // Field in videos collection (Primary Key)//automatically given by MongoDb
                as:"watchHistory",
                //sub pipelines
                pipeline:[
                    {
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",//hm owner se sare details nhi dena chahte hso we will use again a pipeline project
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    },
                    {//ek aur further pipeline, kya kya kiya abhi tk?ek lookup fir uske andr ek  sublookup aur fir project krke as:"owner" mein sara detail dal diya
                        //sara data,owner ke field mein h aur wo as array aaya h
                        //ab jobhi kr rhay h apna frontend sudharne ke lie kr rhay h
                        //agr ye nhi kre to owner[0] mein sara detail:jo jo project kiye h wo aajayega
                        $addFields:{
                            owner:{//yha hmlog owner field of video ko overwrite kr rhay h
                                $first:"$owner"//first q ki as:"owner" field ka pehla value nikal rhay aur $q ki wo field h
                                //ab frontend mein usko ek object milega sirf owner jise wo .username krke sari values nikal lega
                            }
                        }
                    }
                ]
            }
        /*watchHistory: [//watchHistory aise define huwa tha to bs hm id aur ref de denge to wo videos ko select krlega
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ] 
        */
        }

    ])


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
})


export {
    
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory


}