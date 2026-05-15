const mongoose = require("mongoose")
const Schema = mongoose.Schema;


// Create Schema
const ToggleModelSchema = new Schema({

    signupToggle: {
        type: Number,
        default: 0
    },

    timestamps: { created_At: { type: Date, default: Date.now }, updated_At: { type: Date, default: Date.now } },

});

let ToggleModel = mongoose.model("toggle", ToggleModelSchema);

module.exports = ToggleModel


