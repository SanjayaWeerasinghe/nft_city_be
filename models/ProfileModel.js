const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const validator = require("validator")
const { ErrorMessages } = require("../constants/errors")

// Create Schema
const ProfileModelSchema = new Schema({
    user_id: {
        type: Number,
        // unique: true,
        required: true,
    },
    user_name: {
        type: String,
        required: true,
        // unique: true
    },
    first_name: {
        type: String,
        required: true,
    },
    middle_name: {
        type: String,
        required: false,
    },
    last_name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        // enum: ['m', 'f', 'male', 'female', 'other','Male','Female'],
        required: true,
    },
    mobile_number: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        validate: [validator.isEmail, JSON.stringify(ErrorMessages.AUTH.VALIDATION_FAILED("email"))],
        lowercase: true,
        unique: true,
        required: true
    },
    country_name: {
        type: String,
        required: true,
    },
    date_of_birth: {
        type: Date,
        required: true,
    },
    public_address: {
        type: String
    },
    cover_image: {
        type: String
    },
    profile_image: {
        type: String
    },
    display_name: {
        type: String
    },
    twitter_username: {
        type: String
    },
    site_or_portfolio: {
        type: String
    },
    custom_url: {
        type: String
    },

    timestamps: { created_At: { type: Date, default: Date.now }, updated_At: { type: Date, default: Date.now } },
});


let ProfileModel = mongoose.model("profile", ProfileModelSchema);

module.exports = ProfileModel
