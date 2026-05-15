const { body } = require("express-validator");
const { ErrorMessages } = require("../constants/errors")
const { constant } = require("../constants/constant");

const updateWalletValidation = () => [

    body("public_address")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("public_address"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("public_address"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("public_address")),



];


module.exports = {
    updateWalletValidation
}
