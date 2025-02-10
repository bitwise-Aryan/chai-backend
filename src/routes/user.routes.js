import {Router} from "express";
import { loginUser,logoutUser,registerUser,refreshAccessToken } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/register").post(
    upload.fields([//field argument mein hmesa array leta h,yha pe h avatar aur cober image
        {
            name:"avatar",//frontend mein bhi uska nam avatar hona jruri h
            maxCount:1//ki aap ketni file accept kroge,hm ek hi kr rhay// Can accept 1 file (e.g., profile picture)
        },
        {
            name:"coverImage",//coverImage → Can accept 1 file (e.g., background image).
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)//post isliye q ki user se data lerhay h

//secured routes:verifiedJWT->secured route mtlb user loged in h ab
router.route("/logout").post(verifyJWT,logoutUser)//isliye next likhe thay verifyJwt ke bad// middleware chla mthd logoutuser se just pehle,aur chlne ke bad next//aise hi dher sare middleware dal skte h


router.route("/refresh-token").post(refreshAccessToken)
////http://localhost:8000/api/v1/users/register
export default router