import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[3,'Username must be at least 3 charecter long']
    },
    email: {
        type: String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[13,'Email must be at least 3 charecter long']
    },
    password: {
        type: String,
        required:true,
        minlength:[5,'passowrd must be at least 3 charecter long']
    },
})

const userModel = mongoose.model('user', userSchema)

export default userModel