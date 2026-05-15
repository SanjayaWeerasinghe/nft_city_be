const { query, param, body } = require("express-validator");
const { ErrorMessages } = require("../constants/errors");
const { isMongoId } = require("validator");

const getUserTokensOnSaleValidation = () => [
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
const checkMongoIDValidation = () => [
    param("id")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("Id"))
        .bail()
        .custom((value) => {
            return isMongoId(value)
        })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("")),
];
const createCommentValidation = () => [
    param("id")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("nft_id"))
        .bail()
        .custom((value) => isMongoId(value))
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("nft_id")),
    body("review_text")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("review_text"))
        .bail()
        .isString().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("review_text"))
        .bail()
        .notEmpty().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("review_text"))
];

const createReactionValidation = () => [
    param("id")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("nft_id"))
        .bail()
        .custom((value) => isMongoId(value))
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("nft_id")),
    body("reaction_type")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("reaction_type"))
        .bail()
        .isString().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("reaction_type"))
        .bail()
        .isIn(["like", "love", "fire", "party", "dislike"])
        .withMessage("reaction_type must be one of: like, love, fire, party, dislike")
];


const purchaseNftValidation = () => [
    body("nftId")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("nftId"))
        .bail()
        .custom((value) => {
            return isMongoId(value)
        })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("nftId")),

    body("orderId")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("orderId"))
        .bail()
        .custom((value) => {
            return isMongoId(value)
        })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("orderId")),

    body("secret")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("secret"))
        .bail()
        .notEmpty().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("secret"))
];

const placeNewOrderValidation = () => [
    body("nftId")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("nftId"))
        .bail()
        .custom((value) => {
            return isMongoId(value);
        })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("nftId")),

    body("price")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("price"))
        .bail()
        .isNumeric()
        .withMessage(("price must be a number")),

    body("secret")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("secret"))
        .bail()
        .notEmpty().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("secret"))
];

const transferNftValidation = () => [
    body("nftId")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("nftId"))
        .bail()
        .custom((value) => {
            return isMongoId(value);
        })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.ID_NOT_VALID_MONGO_KEY("nftId")),

    body("toUserId")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("toUserId"))
        .bail()
        .notEmpty().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("toUserId")),

    body("secret")
        .exists().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("secret"))
        .bail()
        .notEmpty().withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("secret"))
];



module.exports = {
    getUserTokensOnSaleValidation,
    checkMongoIDValidation,
    createCommentValidation,
    createReactionValidation,
    purchaseNftValidation,
    placeNewOrderValidation,
    transferNftValidation
};
