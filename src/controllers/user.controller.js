import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).send({
        message:"Succesful",
    });
})

export { registerUser };