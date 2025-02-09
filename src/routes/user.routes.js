import {Router} from "express";
import { registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"

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
////http://localhost:8000/api/v1/users/register
export default router