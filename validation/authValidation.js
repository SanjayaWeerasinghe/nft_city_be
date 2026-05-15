const { body } = require("express-validator");
const { ErrorMessages } = require("../constants/errors")
const { constant } = require("../constants/constant");

let userForgotType = [
    "Username",
    "Password"
];

const registerUserValidation = () => [



    body("phone")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("phone"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("phone"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("phone"))
        .bail()
        .isMobilePhone()
        .withMessage("Please enter a valid phone number"),

    body("country_name")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("country_name"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("country_name"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("country_name")),



    body("fullname")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("fullname"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("fullname"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("fullname"))
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.MIN_MAX_LENGTH_ERROR("fullname", 2, 50)),

    body("email")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("email"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("email"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("email"))
        .bail()
        .custom((value) => validateEmail(value))
        .withMessage(ErrorMessages.AUTH.VALIDATION_FAILED("Email")),


    body("username")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("username"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(
            ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("username")
        )
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("username"))
        .bail().custom((value) => validateUsername(value))
        .withMessage(ErrorMessages.AUTH.INVALID_USERNAME("username")),



    body("date_of_birth")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("date_of_birth"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("date_of_birth"))
        .bail()
        .isISO8601()
        .withMessage("Please enter a valid date of birth")
        .bail()
        .custom((value) => validateAge(value))
        .withMessage("You must be at least 16 years old to register"),

    body("gender")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("gender"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("gender"))
        .bail()
        .isIn(['male', 'female', 'other', 'Male', 'Femail'])
        .withMessage("Gender must be male, female, or other"),


    body("password")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("password"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("password"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("password"))
        .bail().custom((value) => validatePassword(value))
        .withMessage(ErrorMessages.AUTH.INVALID_PASSWORD("Password")),

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

const loginUserValidation = () => [
    body("username")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("username"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(
            ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("username")
        )
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("username")),

    body("password")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("password"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("password"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("password"))
];


const otpVerificationValidation = () => [

    body("otpCode")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("otpCode"))
        .bail()
        .isLength({ min: constant.otpTokenLength.minLength, max: constant.otpTokenLength.maxLength })
        .withMessage(ErrorMessages.AUTH.INVALID_OTP_TOKEN(constant.otpTokenLength.minLength, constant.otpTokenLength.maxLength)),

    body("email")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("email"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(
            ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("email")
        )
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("email"))
        .bail().custom((value) => validateEmail(value))
        .withMessage(ErrorMessages.AUTH.VALIDATION_FAILED("email"))
];



const sendOtpVerificationValidation = () => [

    body("email")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("Email"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(
            ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("Email")
        )
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("Email"))
        .bail().custom((value) => validateEmail(value))
        .withMessage(ErrorMessages.AUTH.VALIDATION_FAILED("Email"))
];

const recoverPasswordValidation = () => [

    body("password")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("password"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("password"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("password"))
        .bail().custom((value) => validatePassword(value))
        .withMessage(ErrorMessages.AUTH.INVALID_PASSWORD("Password")),

    body("otp_code")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("otp_code"))
        .bail()
        .isLength({ min: constant.otpTokenLength.minLength, max: constant.otpTokenLength.maxLength })
        .withMessage(ErrorMessages.AUTH.INVALID_OTP_TOKEN(constant.otpTokenLength.minLength, constant.otpTokenLength.maxLength)),

]


const contactUsValidation = () => [
    body("name")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("name"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("name"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("name"))
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.MIN_MAX_LENGTH_ERROR("name", 2, 50))
        .bail()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),

    body("email")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("email"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("email"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("email"))
        .bail()
        .isEmail()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.INVALID_EMAIL),

    body("subject")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("subject"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("subject"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("subject"))
        .bail()
        .isLength({ min: 5, max: 100 })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.MIN_MAX_LENGTH_ERROR("subject", 5, 100)),

    body("message")
        .exists()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.KEY_MISSING("message"))
        .bail()
        .not()
        .isEmpty()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.EMPTY_VALUE("message"))
        .bail()
        .isString()
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.VALUE_MUST_BE_STRING("message"))
        .bail()
        .isLength({ min: 10, max: 1000 })
        .withMessage(ErrorMessages.COMMON_VALIDATION_ERROR.MIN_MAX_LENGTH_ERROR("message", 10, 1000))
];

function validateEmail(email) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}

// function validatePassword(password) {
//     // Password must be at least 8 characters with at least 1 number and 1 alphabet
//     const re = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
//     return re.test(String(password));
// }

function validatePassword(password) {
    //const re = /^(?!.*[_\s-]{2,})[a-zA-Z0-9][a-zA-Z0-9_\-]*[a-zA-Z0-9]$/
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{9,}$/;
    return re.test(String(password))
}


function validateAge(dateOfBirth) {
    if (!dateOfBirth) return false;
    const birthDate = new Date(dateOfBirth);

    // invalid date check
    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();

    // future date check
    if (birthDate > today) return false;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Check if age is between 16 and 100
    return age >= 16 && age <= 100;
}

function validateUsername(username) {
    //const re = /^(?!.*[_\s-]{2,})[a-zA-Z0-9][a-zA-Z0-9_\-]*[a-zA-Z0-9]$/
    const re = /^[a-zA-Z]([.@_-]?[a-zA-Z0-9]+)*$/
    return re.test(String(username))
}

module.exports = {
    registerUserValidation,
    loginUserValidation,
    otpVerificationValidation,
    sendOtpVerificationValidation,
    recoverPasswordValidation,
    contactUsValidation
}
