
const { successResponse, errorResponse } = require("../utils/responses")
const { ErrorMessages } = require("../constants/errors")
const ProfileModel = require("../models/ProfileModel")
const { InfoMessages } = require("../constants/messages")
const { upload, uploadLocal } = require("../utils/helperMethod");

updateWalletAddress = async (req, res) => {

    try {
        const { public_address } = req.body
        await ProfileModel.findOneAndUpdate(
            { user_id: req.user.id },
            {
                public_address: public_address,
            },
            { new: true }
        )
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_UPDATED_SUCCESSFULLY("Wallet addres"), 200)

    } catch (e) {
        console.log("Update wallet error", e.message)
        // cleanupRequestFiles(req); // Safe - only cleans THIS request's files
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("updateWalletAddress"), e.message ? 400 : 500);
    }
};


async function getOwnProfile(req, res) {
    try {


        let profile = await ProfileModel.findOne({ user_id: req.user.id });
        if (!profile) return errorResponse(res, "profile not found", 400);
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Profile Info"), 200, profile)
    } catch (e) {
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getOwnProfile"), e.message ? 400 : 500);
    }
}
async function getProfileByUsername(req, res) {
    try {
        console.log("username", req.query)

        let profile = await ProfileModel.findOne({ user_name: req.query.username });
        if (!profile) return errorResponse(res, "profile not found", 400);
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Profile Info"), 200, profile)
    } catch (e) {
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getOwnProfile"), e.message ? 400 : 500);
    }
}



async function updateProfileCover(req, res) {

    try {
        if (req.files && req.files.img) {
            const extension = req.files.img.name.split('.').pop();
            await uploadLocal({ Key: `profile/covers/${req.user.user_name}.${extension}`, Body: req.files.img.data, });
            // await updateProfileDb(req.user.id, { cover_image: `${req.user.user_name}.${extension}` });
            await ProfileModel.findOneAndUpdate(
                { user_id: req.user.id },
                {
                    cover_image: `${req.user.user_name}.${extension}`
                }
            )


        } else return res.status(400).send('Image is required!');

        return successResponse(res, true, InfoMessages.GENERIC.ITEM_UPDATED_SUCCESSFULLY("Cover image"), 200)
    } catch (e) {
        console.log(e)
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("updateProfileCover"), e.message ? 400 : 500);
    }
}

async function updateProfileInfo(req, res) {
    try {
        const parsedData = JSON.parse(req.body.data || "{}");

        const allowedFields = [
            "display_name",
            "twitter_username",
            "site_or_portfolio",
            "custom_url" // backend field for custom URL
        ];

        const updates = {};

        // Loop through allowed fields and only update if they exist in parsed data
        allowedFields.forEach(field => {
            if (parsedData[field] !== undefined && parsedData[field] !== null && parsedData[field] !== "") {
                updates[field] = parsedData[field];
            }
        });

        // Handle profile image upload if provided
        if (req.files && req.files.img) {
            const extension = req.files.img.name.split(".").pop();
            const imageKey = `profile/personalImage/${req.user.user_name}.${extension}`;

            await uploadLocal({
                Key: imageKey,
                Body: req.files.img.data
            });

            updates.profile_image = `${req.user.user_name}.${extension}`;
        }

        const updatedProfile = await ProfileModel.findOneAndUpdate(
            { user_id: req.user.id },
            { $set: updates },
            { new: true }
        );

        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (e) {
        console.log(e);
        return errorResponse(
            res,
            e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("updateProfileInfo"),
            e.message ? 400 : 500
        );
    }
}

async function getUserProfileByUsernameOrAddress(req, res) {
    try {


        let profile = await ProfileModel.findOne({
            $or: [
                { user_name: req.body.searchParam },
                { public_address: req.body.searchParam } // include this if you store address under this field
            ]
        });
        if (!profile) return errorResponse(res, "profile not found", 400);
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Profile"), 200, profile)
    } catch (e) {
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getOwnProfile"), e.message ? 400 : 500);
    }
}




module.exports = {
    updateWalletAddress,
    getOwnProfile,
    updateProfileCover,
    updateProfileInfo,
    getUserProfileByUsernameOrAddress,
    getProfileByUsername
}
