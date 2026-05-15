const { query } = require("express-validator");
const { ErrorMessages } = require("../constants/errors");

const searchValidation = () => [
    query("searchText")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("searchText"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("searchText"))
        .bail()
        .notEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("searchText"))
        .bail()
        .isLength({ min: 1, max: 200 })
        .withMessage("Search text must be between 1 and 200 characters"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("itemsPerPage")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Items per page must be between 1 and 100")
        .toInt()
];

module.exports = {
    searchValidation
};

