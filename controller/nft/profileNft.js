
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
const crypto = require("crypto");

getListedTokenList = async (req, res) => {
    try {
        // Extract pagination parameters with defaults
        const page = req.query.page || 1;
        const itemsPerPage = req.query.itemsPerPage || constant.constant.paginationDefaultValue.nftListedDefaultItemPerPage;

        // Calculate skip value for pagination
        const skip = (page - 1) * itemsPerPage;


        // Build the query for minted tokens that are not on sale
        console.log("listed userid", req.user.id)

        let profile = await ProfileModel.findOne({ user_name: req.query.username });
        if (!profile) return errorResponse(res, "profile not found", 400);
        let userID = profile.user_id
        // listed userid 16065
        console.log("listed userid", req.user.id, userID)
        const query = {
            current_owner: userID,
            status: constant.constant.tokenStatus.listed,
            on_sale: true
        };

        // Get total count for pagination info
        const totalCount = await NftTokenModel.countDocuments(query);
        console.log("totalCount", totalCount, query)

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // Fetch the tokens with pagination and populate order information
        const tokens = await NftTokenModel.find(query)
            .select('-__v') // Exclude version field
            //.sort({ 'timestamps.created_At': -1 }) // Sort by creation date, newest first
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean(); // Use lean() for better performance

        // Get order information for each token
        const tokensWithOrders = await Promise.all(
            tokens.map(async (token) => {
                const order = await OrderModel.findOne({
                    nft_id: token._id.toString(),
                    user_id: userID
                }).select('_id blockchain_order_id status orderHash timestamps price');

                return {
                    ...token,

                    orderDetails: order ? {
                        orderId: order ? order._id : null,
                        blockchain_order_id: order.blockchain_order_id,
                        status: order.status,
                        orderHash: order.orderHash,
                        created_at: order.timestamps.created_At
                    } : null
                };
            })
        );

        // Build pagination info
        const paginationInfo = {
            current_page: page,
            items_per_page: itemsPerPage,
            total_items: totalCount,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_previous_page: page > 1
        };

        return successResponse(res, true, "Listed tokens retrieved successfully", 200, {
            tokens: tokensWithOrders,
            pagination: paginationInfo
        });

    } catch (error) {
        console.log("getMintedTokenList error:", error.message, error);
        return errorResponse(res, error.message || "Failed to retrieve Listed tokens", 500);
    }
};

getOwnedTokenList = async (req, res) => {
    try {
        // Extract pagination parameters with defaults
        const page = req.query.page || 1;
        const itemsPerPage = req.query.itemsPerPage || constant.constant.paginationDefaultValue.nftListedDefaultItemPerPage;

        // Calculate skip value for pagination
        const skip = (page - 1) * itemsPerPage;

        let profile = await ProfileModel.findOne({ user_name: req.query.username });
        if (!profile) return errorResponse(res, "profile not found", 400);
        let userID = profile.user_id

        // Build the query for minted tokens that are not on sale
        const query = {
            current_owner: userID,
            // status: constant.constant.tokenStatus.minted,
            //status: constant.constant.tokenStatus.transferred,
            on_sale: false
        };

        // Get total count for pagination info
        const totalCount = await NftTokenModel.countDocuments(query);
        console.log("totalCount", totalCount, query)

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // Fetch the tokens with pagination and populate order information
        const tokens = await NftTokenModel.find(query)
            .select('-__v') // Exclude version field
            // .sort({ 'timestamps.created_At': -1 }) // Sort by creation date, newest first
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean(); // Use lean() for better performance

        // Get order information for each token
        const tokensWithOrders = await Promise.all(
            tokens.map(async (token) => {
                const order = await OrderModel.findOne({
                    nft_id: token._id.toString(),
                    user_id: userID
                }).select('_id blockchain_order_id status orderHash timestamps');

                return {
                    ...token,

                    orderDetails: order ? {
                        orderId: order ? order._id : null,
                        blockchain_order_id: order.blockchain_order_id,
                        status: order.status,
                        orderHash: order.orderHash,
                        created_at: order.timestamps.created_At
                    } : null
                };
            })
        );

        // Build pagination info
        const paginationInfo = {
            current_page: page,
            items_per_page: itemsPerPage,
            total_items: totalCount,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_previous_page: page > 1
        };

        return successResponse(res, true, "Minted tokens retrieved successfully", 200, {
            tokens: tokensWithOrders,
            pagination: paginationInfo
        });

    } catch (error) {
        console.log("getOwnedTokenList error:", error.message, error);
        return errorResponse(res, error.message || "Failed to retrieve minted tokens", 500);
    }
};




module.exports = {
    getListedTokenList,
    getOwnedTokenList

}
