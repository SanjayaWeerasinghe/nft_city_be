const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const validator = require("validator")
const { ErrorMessages } = require("../constants/errors")

// Create Schema
const UserModelSchema = new Schema({
    fullname: {
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
    phone: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    country_name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    public_address: {
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    date_of_birth: {
        type: Date,
        required: true,
    },

    timestamps: { created_At: { type: Date, default: Date.now }, updated_At: { type: Date, default: Date.now } },
});


let UserModel = mongoose.model("user", UserModelSchema);

module.exports = UserModel


