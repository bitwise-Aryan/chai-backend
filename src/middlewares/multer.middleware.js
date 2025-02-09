import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {//see notes
    //   cb(null, '/tmp/my-uploads')//   '/tmp/my-uploads' destination jha aap apne file wgera rkhoge(folder)
      cb(null, './public/temp') //cb =callBack fn
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)//not required now
    //   cb(null, file.fieldname + '-' + uniqueSuffix)//acha aadat to nhi h ye  q ki man lo user aryan nam ka hi 5 file upload kr diya to?mgr iske bina bhi kam hoskta h q ki localserver pe bht km sme ke lie data rhega turnt hta denge
      cb(null, file.originalname)//orignalname,
    }
  })
  
  export const upload = multer({ storage: storage })