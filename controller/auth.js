
const { successResponse, errorResponse } = require("../utils/responses")
const { ErrorMessages } = require("../constants/errors")
const ProfileModel = require("../models/ProfileModel")
const toggleModel = require("../models/ToggleModel")
const { generateOTP } = require("../utils/helperMethod")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const emailUtility = require("../utils/emailUtility");
const moment = require("moment")
const { SESSION_EXPIRES_IN, JWT_SECRET_KEY, SIGNUP_SUBJECT, OTP_EXPIRE_TIME, RESNED_OTP_CODE_SUBJECT, RESNED_OTP_EMAIL, SEND_USERNAME_EMAIL, SIGNUP_EMAIL, SEND_EMAIL_SUBJECT } = require("../config")
const { InfoMessages } = require("../constants/messages")
const usersDb = require("../db/users")
const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
registerUser = async (req, res) => {

    try {

        const { email, country_code, phone, username, password, fullname, country_name, gender, date_of_birth, public_address } = req.body
        let phoneNumber = country_code ? country_code + phone : "+61" + phone
        console.log("public_address", public_address)

        //Extract phone number
        let validatedNumber
        // console.log("phoneNumber",  process.env.TWILIO_ACCOUNT_SID,
        //     process.env.TWILIO_AUTH_TOKEN)
        // try {
        //     validatedNumber = await client.lookups.v1
        //         .phoneNumbers(phoneNumber)
        //         .fetch({ countryCode: "US" });
        // } catch (e) {
        //     console.log("error",e)
        //     return errorResponse(res, "Please provide a valid phone number!", 400);
        // }

        validatedNumber = phoneNumber
        // validatedNumber = phoneNumber

        //Check email username and mobile number existance
        const [emailCheck, usernameCheck, phoneCheck, walletCheck] = await Promise.all([
            usersDb.get('email', email, global.connectionCustomerDB),
            usersDb.get('user_name', username, global.connectionCustomerDB),
            usersDb.get('mobile_number', validatedNumber, global.connectionCustomerDB),
            ProfileModel.findOne({ public_address: public_address.toLowerCase() })
        ]);
        if (emailCheck.length > 0) throw new Error(ErrorMessages.AUTH.EMAIL_ALREADY_EXIST(email));
        if (usernameCheck.length > 0) throw new Error(ErrorMessages.AUTH.USERNAME_ALREADY_EXIST(username));
        if (phoneCheck.length > 0) throw new Error(ErrorMessages.AUTH.PHONE_ALREADY_EXIST(validatedNumber));
        if (walletCheck) throw new Error('Wallet address is already registered!');

        //Check toggle
        let signupToggle = 0

        try {
            let toggle = await toggleModel.find({})
            signupToggle = toggle[0].signupToggle
        }
        catch (e) {

        }
        let otpNumber = generateOTP()
        console.log("signupToggle", otpNumber)
        if (signupToggle === 1) {
            try {
                console.log("email send")
                await emailUtility.transporter.sendMail(
                    emailUtility.mailOptions(
                        req.body.email,
                        SIGNUP_SUBJECT,
                        SIGNUP_EMAIL(otpNumber)
                    )
                );
            } catch (emailError) {
                console.log("emailError", emailError)
                throw new Error("Error sending verification email");

            }
        }
        const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        let utcDate = moment().format('YYYY-MM-DD  HH:mm:ss');

        const dataBody = {
            first_name: fullname,
            middle_name: fullname,
            last_name: fullname,
            email: email,
            mobile_number: validatedNumber,
            country_name: country_name,
            user_name: username,
            password: hash,
            gender: gender,
            date_of_birth: date_of_birth,
            isVerified: signupToggle === 1 ? false : true,
            token: otpNumber,
            otp_create_time: utcDate,
        }


        const { insertId } = await usersDb.register(dataBody, global.connectionCustomerDB);
        const [user] = await usersDb.get('id', insertId, global.connectionCustomerDB);


        // Save user info to MongoDB using ProfileModel
        const profileData = new ProfileModel({
            user_id: user.id,
            user_name: user.user_name,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            mobile_number: user.mobile_number,
            email: user.email,
            country_name: user.country_name,
            date_of_birth: user.date_of_birth,
            public_address: public_address // Get from request body and save in lowercase
        });

        await profileData.save();
        console.log("User profile saved to MongoDB successfully");
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_CREATED_SUCCESSFULLY("user"), 200, { signupToggle })

    } catch (e) {
        console.log("registerUser nw uswer error", e.message)
        // cleanupRequestFiles(req); // Safe - only cleans THIS request's files
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("RegisterUser"), e.message ? 400 : 500);
    }
};

loggedInUser = async (req, res) => {
    try {

        const { username, password } = req.body
        // decrypt password
        var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        // Single query to check both username and password
        const userCheck = await usersDb.authenticateUser(username, hash, global.connectionCustomerDB);
        if (userCheck.length === 0) throw new Error(ErrorMessages.AUTH.USER_NOT_FOUND);

        // User found and authenticated
        const user = userCheck[0];
        if (!user.isVerified) {
            return errorResponse(res, "Your account is not active.", 403, { email: user.email })
        }

        // Handle MongoDB profile creation/sync with proper error handling
        let profile;
        try {
            profile = await ProfileModel.findOneAndUpdate(
                { user_id: user.id }, // Query by user ID only
                {
                    user_id: user.id,
                    user_name: user.user_name,
                    first_name: user.first_name,
                    middle_name: user.middle_name,
                    last_name: user.last_name,
                    gender: user.gender,
                    mobile_number: user.mobile_number,
                    email: user.email,
                    country_name: user.country_name,
                    date_of_birth: user.date_of_birth,
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
        const jwtToken = jwt.sign(
            {
                id: user.id,
            },
            JWT_SECRET_KEY,
            {
                expiresIn: SESSION_EXPIRES_IN,
            }
        );

        return successResponse(res, true, InfoMessages.AUTH.LOGIN_MESSAGE, 200, { token: jwtToken })
    }
    catch (e) {
        console.log("loggedInUser error", e)
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("Login"), e.message ? 400 : 500);
    }
}
verifyOtpToken = async (req, res) => {

    try {
        const { email, otpCode } = req.body
        const userCheck = await usersDb.authenticateUserOtp(email, otpCode, global.connectionCustomerDB);
        const user = userCheck[0]

        // if not exist
        if (userCheck.length === 0) return errorResponse(res, ErrorMessages.AUTH.INVALID_OTP, 400)

        console.log("user", user)
        var utcMoment = moment.utc()
        var utcDate = new Date(utcMoment.format())
        console.log("utcDate", utcDate)
        var diff = (utcDate.getTime() - user.otp_create_time.getTime()) / 1000
        const diffInMinute = diff / 60
        console.log("diffInMinute", diffInMinute, diff)
        if (diffInMinute > OTP_EXPIRE_TIME) {
            return errorResponse(res, ErrorMessages.AUTH.OTP_CODE_EXPIRED, 400)
        }
        await usersDb.verifyUser(otpCode, global.connectionCustomerDB);
        successResponse(res, true, InfoMessages.AUTH.VERIFY_MESSAGE)

    }
    catch (e) {
        console.log("Error in getUserAgainstOtpCode in verifyOtpToken", e)
        return errorResponse(res, ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("Verify otp"), 500)
    }
}

sendOtpTokenToEmail = async (req, res) => {


    try {

        let { email } = req.body
        const user = await usersDb.get('email', email, global.connectionCustomerDB)
        if (user.length === 0) return successResponse(res, true, InfoMessages.AUTH.OTP_SEND_SUCCESSFULLY(email))

        let otpNumber = generateOTP()
        await usersDb.updateUserOtp(email, otpNumber, global.connectionCustomerDB);
        console.log("otpNumber", otpNumber)

        await emailUtility.transporter.sendMail(
            emailUtility.mailOptions(
                req.body.email,
                RESNED_OTP_CODE_SUBJECT,
                RESNED_OTP_EMAIL(otpNumber)
            )
        );

        return successResponse(res, true, InfoMessages.AUTH.RESEND_OTP)
    } catch (e) {
        console.log("Error", e)
        return errorResponse(res, ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("Resend otp"), 500)
    }
};

sendUsernameToEmail = async (req, res) => {

    try {
        let { email } = req.body
        const user = await usersDb.get('email', email, global.connectionCustomerDB)
        if (user.length === 0) return successResponse(res, true, InfoMessages.AUTH.OTP_SEND_SUCCESSFULLY(email))
        await emailUtility.transporter.sendMail(
            emailUtility.mailOptions(
                req.body.email,
                SEND_EMAIL_SUBJECT,
                SEND_USERNAME_EMAIL(user[0].user_name)
            )
        );

        return successResponse(res, true, InfoMessages.AUTH.RESEND_OTP)
    } catch (e) {
        console.log("Error", e)
        return errorResponse(res, ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("Resend otp"), 500)
    }
};


recoverUserPassword = async (req, res) => {
    try {
        let { otp_code, password } = req.body

        const userCheck = await usersDb.get('token', otp_code, global.connectionCustomerDB)
        //if not exist
        if (userCheck.length === 0) return errorResponse(res, ErrorMessages.AUTH.WRONG_OTP_CODE, 400)
        const user = userCheck[0]

        var utcMoment = moment.utc()
        var utcDate = new Date(utcMoment.format())
        var diff = (utcDate.getTime() - user.otp_create_time.getTime()) / 1000
        const diffInMinute = diff / 60
        if (diffInMinute > OTP_EXPIRE_TIME) {
            return errorResponse(res, ErrorMessages.AUTH.OTP_CODE_EXPIRED_UPDATE_PASSWORD, 400)
        }
        await usersDb.resetPassword(otp_code, password, global.connectionCustomerDB);

        //return response
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_UPDATED_SUCCESSFULLY("Password"))

    } catch (e) {
        console.log("error in updateUserPassword", e);
        return errorResponse(res, ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("recoverUserPassword"), 500)
    }
};






module.exports = {
    registerUser,
    loggedInUser,
    sendOtpTokenToEmail,
    verifyOtpToken,
    recoverUserPassword,
    sendUsernameToEmail
}
