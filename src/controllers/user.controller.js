import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError} from "../utils/apiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };
    } catch (error) {
        throw new apiError(501, "Generation of refresh and access tokens failed");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password} = req.body;

    if([userName, email, fullName, password].some((ele) => ele.trim() === "" )){
        throw new apiError(400, "All the fields are required");
    }

    if(email.indexOf("@") === -1 || email.indexOf(".") === -1){
        throw new apiError(400,"Invalid email address");
    }

    const existedUser = await User.findOne({
        $or:[{email}, {userName}],
    })

    if(existedUser){
        throw new apiError(409,"User with this email or userName already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar is required");
    }

    let coverImageLocalPath;

    if (Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);    

    if(!avatar){
        throw new apiError(400,"Avatar is required");
    }

    const user = await User.create({
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        email,
        password,
        userName,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"Something went wrong while uploading user");
    }

    return res.status(201).json(
        new apiResponse(201, createdUser, "User created succesfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { userName, email, password} = req.body;
    // console.log(req.body);

    if(!(email || userName)){
        throw new apiError(400,"UserName or Email is required");
    }

    const user = await User.findOne({
        $or:[{email}, {userName}],
    })

    if(!user){
        throw new apiError(404,"User does not exists");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new apiError(401, "Invalid login credentials");    
    }

    const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new apiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User login succesfull")
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,{
        $set: {refreshToken: undefined}
    },{
        new: true
    })

    return res.status(200).clearCookie("refreshToken", options).clearCookie("accessToken", options).json(
        new apiResponse(200, {}, "User logged out succesfully")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new apiError(401,"Invalid refresh token");
        }
    
        if(user.refreshToken !== incomingRefreshToken){
            throw new apiError(401,"Invalid or expired refresh token");
        }
    
        const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(
            new apiResponse(200,{
                accessToken, refreshToken, user,
            } ,"Access token was refreshed succesfully")
        )
    } catch (error) {
        throw new apiError(401,error?.message || "Error while refreshing access token");
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };