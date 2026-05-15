const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const { ErrorMessages } = require("../constants/errors")

// Create Schema
const NftTokenModelSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    royalties: {
        type: Number,
        default: null,
        min: 0,
        max: 100, // Percentage
    },
    price: {
        type: Number,
        default: null,
        min: 0,
    },
    resource_url: {
        type: String,
        required: true,
    },
    resource_type: {
        type: String,
        required: true,
        enum: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav'], // Common NFT file types
    },
    payload: {
        type: String,
        required: true,
    },
    public_address: {
        type: String,
        required: true,
    },
    properties: {
        type: Schema.Types.Mixed, // Allows flexible object structure like {"size":"Sizee","type":"ndndnd"}
        default: null,
        required: false
    },
    alternativeText: {
        type: String,
        default: null,
        required: false
    },
    status: {
        type: String,
        enum: ['draft', 'minted', 'listed', 'sold', 'transferred','cancel'],
        default: 'draft'
    },
    token_id: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    blockchain_token_id: {
        type: Number,
        unique: true,
        required: true
    },
    contract_address: {
        type: String,
        default: null
    },
    blockchain: {
        type: String,
        enum: ['ethereum', 'polygon', 'binance', 'solana','substrate'],
        default: 'ethereum'
    },

    timestamps: {
        created_At: { type: Date, default: Date.now },
        updated_At: { type: Date, default: Date.now }
    },
    on_sale: {
        type: Boolean,
        default: false
    },
    current_owner: {
        type: Number,
        required: true, // Always has an owner (starts same as user_id)
    },
    previous_owner: {type: Number,default: null},
    nft_minted_hash: {
        type: String,
        // unique: true,
    }
});

// Add indexes for better query performance
NftTokenModelSchema.index({ user_id: 1 });
NftTokenModelSchema.index({ public_address: 1 });
NftTokenModelSchema.index({ status: 1 });
NftTokenModelSchema.index({ type: 1 });

// Update the updated_At field before saving
NftTokenModelSchema.pre('save', function (next) {
    this.timestamps.updated_At = Date.now();
    next();
});

let NftTokenModel = mongoose.model("nft_token", NftTokenModelSchema);

module.exports = NftTokenModel
