const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NftHistorySchema = new Schema({
  nft_id: { type: Schema.Types.ObjectId, ref: "nft_token", required: true },
  token_id: { type: String, required: true },
  action: {
    type: String,
    enum: ["minted", "listed", "sold", "transferred","cancel"],
    required: true,
  },
  from_user: { type: Number, default: null },
  to_user: { type: Number, default: null },
  price: { type: Number, default: null },
  order_id: { type: Schema.Types.ObjectId, ref: "order", default: null },
  tx_hash: { type: String, default: null },
  blockchain: {
    type: String,
    enum: ["ethereum", "polygon", "binance", "solana", "substrate"],
    default: "substrate", // since you’re using Polkadot/Substrate chain
  },
  timestamp: { type: Date, default: Date.now },
});

NftHistorySchema.index({ nft_id: 1, action: 1, timestamp: -1 });

module.exports = mongoose.model("nft_history", NftHistorySchema);
