class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",//overwrite message if something else is passed
        errors = [],
        stack = ""
    ){
        super(message)//super does-->	•	Call a parent class constructor.  •	Access parent class methods.
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}