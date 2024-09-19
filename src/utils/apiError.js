// its the class in node js
// here we create basic contructor to send the mssgae 
// also create the overwrite part to add things
// using supper overwriting

class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        // to overwrite the error 
        super(message)
        this.statusCode = statusCode
        // whats in this.data filed
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