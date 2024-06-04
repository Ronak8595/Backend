import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError} from "../utils/apiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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

export { registerUser };