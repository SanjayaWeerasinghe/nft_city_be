
const { successResponse, errorResponse } = require("../utils/responses")
const { ErrorMessages } = require("../constants/errors")
const ProfileModel = require("../models/ProfileModel")
const { InfoMessages } = require("../constants/messages")

getNucBalance = async (req, res) => {

    try {
        console.log("user sesson",req.user)
        let profile = await ProfileModel.findOne({ user_id: req.user.id });
        const { data: { free } } = (await global.api.query.system.account(profile.public_address)).toJSON();
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Nuc balance"), 200, {
            address: profile.public_address,
            balance: parseFloat((parseInt(free) / 10 ** process.env.DECIMAL).toFixed(3)),
            currency: "NUC",
        })

    } catch (e) {
        console.log("Balance error", e.message)
        // cleanupRequestFiles(req); // Safe - only cleans THIS request's files
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getNucBalance"), e.message ? 400 : 500);
    }
};



module.exports = {
    getNucBalance
}
