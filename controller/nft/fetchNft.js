
const { successResponse, errorResponse } = require("../../utils/responses")
const { ErrorMessages } = require("../../constants/errors")
const ProfileModel = require("../../models/ProfileModel")
const { InfoMessages } = require("../../constants/messages")
const _ = require('lodash');
const { isVideo, upload } = require("../../utils/helperMethod");
const NftTokenModel = require("../../models/NftTokenModel");
const OrderModel = require("../../models/OrderModel");
const CommentModel = require("../../models/CommentModel");
const CounterModel = require("../../models/CounterModel");
const NftReactionModel = require("../../models/NftReactionModel");
const NftHistoryModel = require("../../models/NftHistoryModel");
const { Keyring } = require('@polkadot/api');
const { mnemonicValidate } = require('@polkadot/util-crypto');
const mongoose = require('mongoose');
const { register } = require("../../db/users");
const constant = require("../../constants/constant");
const crypto = require("crypto")


async function getNftDetailByID(req, res) {
    try {
        let nft = await NftTokenModel.findOne({ _id: req.params.id }).lean();
        if (!nft) return errorResponse(res, "nft not found", 400);

        // Fetch current owner profile
        let currentOwnerProfile = null;
        if (nft.current_owner) {
            currentOwnerProfile = await ProfileModel.findOne({ user_id: nft.current_owner }).select('user_name first_name middle_name last_name profile_image')
                .lean();

        }
        // Fetch previous owner profile (if exists)
        let previousOwnerProfile = null;
        if (nft.previous_owner) {
            previousOwnerProfile = await ProfileModel.findOne({ user_id: nft.previous_owner }).
                select('user_name first_name middle_name last_name profile_image')
                .lean();

        }
        let creatorProfile = null;
        creatorProfile = await ProfileModel.findOne({ user_id: nft.user_id }).select('user_name first_name middle_name last_name profile_image').lean();
        let openOrder = await OrderModel.findOne({ nft_id: nft._id, status: constant.constant.orderStatus.open }).lean();



        // Prepare response with owner details
        const nftWithOwnerDetails = {
            ...nft,
            current_owner_details: currentOwnerProfile,
            previous_owner_details: previousOwnerProfile,
            creator_details: creatorProfile,
            openOrder: openOrder
        };
        return successResponse(res, true, InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Nft detail"), 200, nftWithOwnerDetails)
    } catch (e) {
        console.log("getNftDetailByID error:", e);
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getNftDetailByID"), e.message ? 400 : 500);
    }
}




async function getNftOwnershipHistory(req, res) {
    try {
        const nftId = req.params.id;
        // Ensure NFT exists
        const nft = await NftTokenModel.findOne({ _id: nftId }).lean();
        if (!nft) {
            return errorResponse(res, "NFT not found", 400);
        }

        // Get ownership history - actions that change ownership
        const ownershipHistory = await NftHistoryModel.find({
            nft_id: nftId,
            action: { $in: ["minted", "sold", "transferred"] }
        }).sort({ timestamp: 1 }) // chronological order
            .select('-__v')
            .lean();

        // Enrich with user profile details
        const enrichedHistory = await Promise.all(
            ownershipHistory.map(async (record) => {
                let fromUserProfile = null;
                let toUserProfile = null;

                // For minted, from_user is null, only to_user exists
                if (record.from_user) {
                    fromUserProfile = await ProfileModel.findOne({ user_id: record.from_user })
                        .select('user_name first_name middle_name last_name profile_image public_address')
                        .lean();
                }

                if (record.to_user) {
                    toUserProfile = await ProfileModel.findOne({ user_id: record.to_user })
                        .select('user_name first_name middle_name last_name profile_image public_address')
                        .lean();
                }

                return {
                    ...record,
                    from_user_details: fromUserProfile,
                    to_user_details: toUserProfile,
                    // Add a readable ownership change description
                    ownership_change: record.action === "minted"
                        ? "Minted by creator"
                        : record.action === "sold"
                            ? "Sold to new owner"
                            : "Transferred to new owner"
                };
            })
        );

        // Get creator profile
        const creatorProfile = await ProfileModel.findOne({ user_id: nft.user_id })
            .select('user_name first_name middle_name last_name profile_image public_address')
            .lean();

        // Get current owner profile
        const currentOwnerProfile = await ProfileModel.findOne({ user_id: nft.current_owner })
            .select('user_name first_name middle_name last_name profile_image public_address')
            .lean();

        return successResponse(res, true, "NFT ownership history retrieved successfully", 200, {
            nft_details: {
                ...nft,
                creator_profile: creatorProfile,
                current_owner_profile: currentOwnerProfile
            },
            ownership_history: enrichedHistory,
            total_ownership_changes: enrichedHistory.length
        });
    } catch (error) {
        console.log("getNftOwnershipHistory error:", error);
        return errorResponse(res, error.message || "Failed to retrieve NFT ownership history", 500);
    }
}



async function getNftHistoryById(req, res) {
    try {
        const nftId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftHistoryDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Ensure NFT exists
        const nftExists = await NftTokenModel.exists({ _id: nftId });
        if (!nftExists) {
            return errorResponse(res, "NFT not found", 400);
        }

        const query = { nft_id: nftId };

        const totalCount = await NftHistoryModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const history = await NftHistoryModel.find(query)
            .select('-__v')
            .sort({ timestamp: -1 }) // Most recent first
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich history with user profile information
        const enrichedHistory = await Promise.all(
            history.map(async (record) => {
                let fromUserProfile = null;
                let toUserProfile = null;

                if (record.from_user) {
                    fromUserProfile = await ProfileModel.findOne({ user_id: record.from_user })

                }

                if (record.to_user) {
                    toUserProfile = await ProfileModel.findOne({ user_id: record.to_user })

                }

                return {
                    ...record,
                    from_user_details: fromUserProfile,
                    to_user_details: toUserProfile
                };
            })
        );

        return successResponse(res, true, "NFT history retrieved successfully", 200, {
            history: enrichedHistory,
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
        console.log("getNftHistoryById error:", e);
        return errorResponse(res, e.message || "Failed to retrieve NFT history", 500);
    }
}

async function getActiveOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftActiveOrderDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Get all active orders for the user
        const query = {
            user_id: req.user.id,
            status: constant.constant.orderStatus.open
        };

        const totalCount = await OrderModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const orders = await OrderModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with NFT details
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const nft = await NftTokenModel.findOne({ _id: order.nft_id })
                    .select('title description resource_url resource_type price blockchain_token_id')
                    .lean();

                return {
                    ...order,
                    nft_details: nft
                };
            })
        );

        return successResponse(res, true, "Active orders retrieved successfully", 200, {
            orders: enrichedOrders,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (error) {
        console.log("getActiveOrders error:", error);
        return errorResponse(res, error.message || "Failed to retrieve active orders", 500);
    }
}

async function getUserCreatedNfts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftCreatedByUserDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;
        let profile = await ProfileModel.findOne({ user_name: req.query.username });
        if (!profile) return errorResponse(res, "profile not found", 400);
        let userID = profile.user_id

        // Get all NFTs created by user (regardless of current owner)
        const query = {
            user_id: userID
        };

        const totalCount = await NftTokenModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const nfts = await NftTokenModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with current owner details
        const enrichedNfts = await Promise.all(
            nfts.map(async (nft) => {
                let ownerProfile = null;
                if (nft.current_owner !== userID) {
                    ownerProfile = await ProfileModel.findOne({ user_id: nft.current_owner })
                        .select('user_id display_name user_name profile_image')
                        .lean();
                }

                return {
                    ...nft,
                    current_owner_details: ownerProfile
                };
            })
        );

        return successResponse(res, true, "Created NFTs retrieved successfully", 200, {
            nfts: enrichedNfts,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (error) {
        console.log("getUserCreatedNfts error:", error);
        return errorResponse(res, error.message || "Failed to retrieve created NFTs", 500);
    }
}








async function getCloseOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftActiveOrderDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Get all active orders for the user
        const query = {
            user_id: req.user.id,
            status: constant.constant.orderStatus.sold
        };

        const totalCount = await OrderModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const orders = await OrderModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with NFT details
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                // Fetch NFT details
                const nft = await NftTokenModel.findOne({ _id: order.nft_id })
                    .select('title description resource_url resource_type price blockchain_token_id')
                    .lean();

                // Fetch user (purchaser) details
                const purchaser = await ProfileModel.findOne({ user_id: order.purchasedBy })
                    .select('first_name user_name user_id')
                    .lean();

                return {
                    ...order,
                    nft_details: nft,
                    purchaser_details: purchaser,
                };
            })
        );

        return successResponse(res, true, "Closed orders retrieved successfully", 200, {
            orders: enrichedOrders,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (error) {
        console.log("getActiveOrders error:", error);
        return errorResponse(res, error.message || "Failed to retrieve close orders", 500);
    }
}

async function getCancelOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftActiveOrderDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Get all active orders for the user
        const query = {
            user_id: req.user.id,
            status: constant.constant.orderStatus.cancel
        };

        const totalCount = await OrderModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const orders = await OrderModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with NFT details
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const nft = await NftTokenModel.findOne({ _id: order.nft_id })
                    .select('title description resource_url resource_type price blockchain_token_id')
                    .lean();

                return {
                    ...order,
                    nft_details: nft
                };
            })
        );

        return successResponse(res, true, "Closed orders retrieved successfully", 200, {
            orders: enrichedOrders,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (error) {
        console.log("getActiveOrders error:", error);
        return errorResponse(res, error.message || "Failed to retrieve close orders", 500);
    }
}

async function getAllNftsOnSale(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || constant.constant.paginationDefaultValue.nftMarketPlaceDefaultItemPerPage;
        const skip = (page - 1) * itemsPerPage;

        // Build query for all NFTs currently on sale
        const query = {
            status: constant.constant.tokenStatus.listed,
            on_sale: true
        };

        const totalCount = await NftTokenModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const nfts = await NftTokenModel.find(query)
            .select('-__v')
            .sort({ _id: -1 }) // Most recent listings first
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with owner details and active order
        const enrichedNfts = await Promise.all(
            nfts.map(async (nft) => {
                const ownerProfile = await ProfileModel.findOne({ user_id: nft.current_owner })
                    .select('user_id display_name user_name profile_image first_name last_name')
                    .lean();

                const activeOrder = await OrderModel.findOne({
                    nft_id: nft._id.toString(),
                    status: constant.constant.orderStatus.open
                }).select('_id blockchain_order_id price orderHash').lean();

                return {
                    ...nft,
                    owner_details: ownerProfile,
                    active_order: activeOrder
                };
            })
        );

        return successResponse(res, true, "Marketplace NFTs retrieved successfully", 200, {
            nfts: enrichedNfts,
            pagination: {
                current_page: page,
                items_per_page: itemsPerPage,
                total_items: totalCount,
                total_pages: totalPages,
                has_next_page: page < totalPages,
                has_previous_page: page > 1
            }
        });
    } catch (error) {
        console.log("getAllNftsOnSale error:", error);
        return errorResponse(res, error.message || "Failed to retrieve marketplace NFTs", 500);
    }
}

module.exports = {
    getNftDetailByID,
    getNftOwnershipHistory,
    getNftHistoryById,
    getActiveOrders,
    getUserCreatedNfts,
    getCloseOrders,
    getCancelOrders,
    getAllNftsOnSale

}