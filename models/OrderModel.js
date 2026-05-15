const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const { ErrorMessages } = require("../constants/errors")

// Create Schema
const OrderModelSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
    },
    nft_id: {
        type: String,
        required: true,
    },
    orderHash: {
        type: String,
        // unique: true,
    },
    status: {
        type: String,
        enum: ['draft', "open", "close", "sold", "cancel"],

    },
    blockchain_order_id: {
        type: Number,
        unique: true,
        required: true
    },
    purchasedBy: {
        type: Number,
    },

    price: { type: Number, default: null },
    timestamps: {
        created_At: { type: Date, default: Date.now },
        updated_At: { type: Date, default: Date.now }
    },
});

// Add indexes for better query performance
OrderModelSchema.index({ user_id: 1 });
OrderModelSchema.index({ nft_id: 1 });
OrderModelSchema.index({ orderHash: 1 });
OrderModelSchema.index({ status: 1 });
OrderModelSchema.index({ created_At: -1 });

// Update the updated_At field before saving
OrderModelSchema.pre('save', function (next) {
    this.timestamps.updated_At = Date.now();
    next();
});

let OrderModel = mongoose.model("order", OrderModelSchema);

module.exports = OrderModel
