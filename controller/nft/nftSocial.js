
const { successResponse, errorResponse } = require("../../utils/responses")
const { ErrorMessages } = require("../../constants/errors")
const ProfileModel = require("../../models/ProfileModel")
const _ = require('lodash');
const NftTokenModel = require("../../models/NftTokenModel");
const CommentModel = require("../../models/CommentModel");
const NftReactionModel = require("../../models/NftReactionModel");
const mongoose = require('mongoose');
const constant = require("../../constants/constant");



async function addCommentReview(req, res) {
    try {
        const nftId = req.params.id;
        const { review_text } = req.body;

        // Ensure NFT exists
        const nft = await NftTokenModel.exists({ _id: nftId });
        if (!nft) {
            return errorResponse(res, "NFT not found", 400);
        }

        // Enforce single comment per user per NFT
        const existing = await CommentModel.findOne({ nft_id: nftId, user_id: req.user.id });
        // if (existing) {
        //     return errorResponse(res, "You have already submitted a comment for this NFT.", 400);
        // }

        // Build user_meta
        const profile = await ProfileModel.findOne({ user_id: req.user.id }).lean();
        const userMeta = {
            name: profile?.display_name || req.user?.user_name || "Anonymous",
            profile_image: profile?.profile_image || null,
            user_name: profile?.user_name || req.user?.user_name || "Unknown"
        };

        const doc = new CommentModel({
            nft_id: nftId,
            user_id: req.user.id,
            user_meta: userMeta,
            review_text
        });

        const savedComment = await doc.save();
        console.log("daveee", savedComment)

        return successResponse(res, true, "Comment added successfully", 200, savedComment);
    } catch (e) {
        // Handle duplicate key (unique index violation)
        return errorResponse(res, e.message || ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("addCommentReview"), e.message ? 400 : 500);
    }
}


async function getCommentsByNftId(req, res) {
    try {
        const nftId = req.params.id;
        const page = req.query.page || 1;
        const itemsPerPage = req.query.itemsPerPage || constant.constant.paginationDefaultValue.nftCommentDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Ensure NFT exists
        const nftExists = await NftTokenModel.exists({ _id: nftId });
        if (!nftExists) {
            return errorResponse(res, "nft not found", 400);
        }

        const query = { nft_id: nftId };

        const totalCount = await CommentModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const comments = await CommentModel.find(query)
            .select('-__v')
            // .sort({ 'createdAt': -1 })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        return successResponse(res, true, "Comments retrieved successfully", 200, {
            comments,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (e) {
        return errorResponse(res, e.message || "Failed to retrieve comments", e.message ? 400 : 500);
    }
}

async function addOrUpdateReaction(req, res) {
    try {
        const nftId = req.params.id;
        const { reaction_type } = req.body;

        // Ensure NFT exists
        const nft = await NftTokenModel.exists({ _id: nftId });
        if (!nft) {
            return errorResponse(res, "NFT not found", 400);
        }

        // Prepare user_meta
        const profile = await ProfileModel.findOne({ user_id: req.user.id }).lean();
        const userMeta = {
            name: profile?.display_name || req.user?.user_name || "Anonymous",
            profile_image: profile?.profile_image || null,
            user_name: profile.user_name
        };

        // Upsert (add new or update existing reaction)
        const reaction = await NftReactionModel.findOneAndUpdate(
            { nft_id: nftId, user_id: req.user.id },
            {
                $set: {
                    reaction_type,
                    user_meta: userMeta
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return successResponse(res, true, "Reaction added/updated successfully", 200, reaction);
    } catch (e) {
        return errorResponse(res, e.message || "Failed to add/update reaction", e.message ? 400 : 500);
    }
}

async function getReactionsByNftId(req, res) {
    try {
        const nftId = req.params.id;
        const page = req.query.page || 1;
        const itemsPerPage = req.query.itemsPerPage || constant.constant.paginationDefaultValue.nftReactionDefaultItemPerPage;

        const skip = (page - 1) * itemsPerPage;

        // Check NFT exists
        const nftExists = await NftTokenModel.exists({ _id: nftId });
        if (!nftExists) {
            return errorResponse(res, "nft not found", 400);
        }

        // List reactions
        const query = { nft_id: nftId };
        const totalCount = await NftReactionModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        const reactions = await NftReactionModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Aggregate counts per reaction type
        const agg = await NftReactionModel.aggregate([
            { $match: { nft_id: new mongoose.Types.ObjectId(nftId) } },
            { $group: { _id: "$reaction_type", count: { $sum: 1 } } }
        ]);
        const counts = {};
        ["like", "love", "fire", "party", "dislike"].forEach(type => {
            counts[type] = agg.find(i => i._id === type)?.count || 0;
        });

        // Get current user's reaction
        const userReaction = await NftReactionModel.findOne({ nft_id: nftId, user_id: req.user.id }).select('reaction_type').lean();

        return successResponse(res, true, "Reactions retrieved successfully", 200, {
            reactions,
            counts,
            userReaction: userReaction ? userReaction.reaction_type : null,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (e) {
        return errorResponse(res, e.message || "Failed to retrieve reactions", e.message ? 400 : 500);
    }
}

module.exports = {

    addCommentReview,
    getCommentsByNftId,
    addOrUpdateReaction,
    getReactionsByNftId,

}
