const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NftReactionModelSchema = new Schema({
  nft_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "nft_token"
  },
  user_id: {
    type: Number,
    required: true
  },
  user_meta: {
    name: { type: String, required: true },
    profile_image: { type: String, default: null },
    user_name: { type: String, required: true }
  },
  reaction_type: {
    type: String,
    enum: ["like", "love", "fire", "party", "dislike"],
    required: true
  }
},
  {
    timestamps: true
  }
);


const NftReactionModel = mongoose.model("nft_reaction", NftReactionModelSchema);
module.exports = NftReactionModel;