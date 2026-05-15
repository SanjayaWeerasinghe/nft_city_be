const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentModelSchema = new Schema({
    nft_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "nft_token"
    },
    // Using Number to match MySQL user IDs in this codebase
    user_id: {
        type: Number,
        required: true
    },
    user_meta: {
        name: {
            type: String,
            required: true
        },
        profile_image: {
            type: String,
            default: null
        },
        user_name: {
            type: String,
            required: true
        },
    },
    review_text: {
        type: String,
        required: true,
        trim: true
    },

},
    {
        timestamps: true
    }
);



let CommentModel = mongoose.model("comment", CommentModelSchema);
module.exports = CommentModel;