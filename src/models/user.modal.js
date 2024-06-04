import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.schema({
    userName:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true,
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String,
        required: true,
    },
    coverImage:{
        type: String,
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: "Video",
    }],
    password:{
        type: String,
        required: [true, "Password is required!"],
    },
    refreshToken:{
        type: String,
    },
},{
    timestamps: true,
});


userSchema.pre("save", async function(next){
    if(!isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
    }, process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
    {
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXIRY
    })
}

export const User = mongoose.model("User", userSchema)