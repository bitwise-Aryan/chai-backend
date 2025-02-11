import mongoose from "mongoose"
//or import mongoose, { Schema } from "mongoose";//if we write like this then we write const subscriptionSchema=new Schema(

const subscriptionSchema=new mongoose.Schema(
    {
        subscriber:{
            type:mongoose.Schema.Types.ObjectId,//one who is subscribing
            ref:'User'
        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,//one to whom subscriber is subscribing//channel bhi to ek user hi h
            ref:'User'
        }
    },{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)