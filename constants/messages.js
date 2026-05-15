
const InfoMessages = {
	AUTH: {
		REGISTER_SUCCESSFULLY: (email, phone) => `Registered Successfully.We have sent the verification OTP code.Please check your Email:${email} or Phone:${phone} and verify the otp code`,
		REGISTER_SUCCESSFULLY_WITHOUT_OTP: `You registered Successfully`,
		LOGIN_MESSAGE: "Login Successfully",
		TOKEN_VALID: (token) => `Token ${token} is valid.`,
		RESEND_OTP: `OTP code send again`,
		VERIFY_MESSAGE: "Your account is successfully verified",
		REGISTER_WITH_EMAIL_MESSAGE: "Registered Successfully.We have sent you OTP code to verify email.Please check your email",
		REGISTER_WITH_PHONE_MESSAGE: "Registered Successfully.We have sent you OTP code to verify phone.Please check your phone number",
		SEND_VERIFICATION_CODE_EMAIL: `We have sent you a verification code.Check your email`,
		SEND_VERIFICATION_CODE_PHONE: `We have sent you a verification code.Check your phone`,
		PASSWORD_MISMATCH: `Password and confirm password not match`,
		LOGIN_SUCCESSFULLY_OTP: (email, phone) => `We have sent the verification OTP code.Please check your Email:${email} or Phone:${phone} and verify the otp code`,
		USER_NAME_SEND_SUCCESSFULLY: (value, valu1) => `We've sent you a ${value} in your ${valu1}.`,
		FOGET_PASSWORD_OTP_SEND_SUCCESSFULLY: (value) => `We've sent you a otpCode in your ${value}.`,
		OTP_SEND_SUCCESSFULLY: (email) => `We have sent the verification OTP code.Please check your Email:${email} and verify the otp code`
	},
	GENERIC: {
		ITEM_UPDATED_SUCCESSFULLY: (value) => `${value} updated successfully.`,
		ITEM_CREATED_SUCCESSFULLY: (key) => `${key} is created successfully.`,
		ITEM_GET_SUCCESSFULLY: (key) => `${key} get successfully.`,
		ITEM_ADDED_SUCCESSFULLY: (key) => `${key} added successfully.`,
		ITEM_DELETED_SUCCESSFULLY: (key) => `${key} deleted successfully.`,


	},
}
module.exports = {
	InfoMessages: InfoMessages,
}
