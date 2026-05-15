const { successResponse, errorResponse } = require("../utils/responses");
const { ErrorMessages } = require("../constants/errors");
const { InfoMessages } = require("../constants/messages");
const NftTokenModel = require("../models/NftTokenModel");
const OrderModel = require("../models/OrderModel");
const ProfileModel = require("../models/ProfileModel");
const constant = require("../constants/constant");

/**
 * Get top NFTs based on order count
 * Only includes NFTs that are currently on sale (on_sale: true and status: 'listed')
 */
async function getTopNfts(req, res) {
    try {
        const { limit = 2 } = req.query;
        const topLimit = parseInt(limit);

        // Step 1: Find all NFTs that are currently on sale
        const nftsOnSale = await NftTokenModel.find({
            on_sale: true,
            status: constant.constant.tokenStatus.listed
        })
        .select('_id blockchain_token_id title description resource_url resource_type price user_id user_name current_owner status on_sale')
        .lean();

        if (nftsOnSale.length === 0) {
            return successResponse(
                res,
                true,
                InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Top NFTs"),
                200,
                {
                    message: "No NFTs currently on sale",
                    topNfts: []
                }
            );
        }

        // Step 2: Get order counts for each NFT
        const nftIds = nftsOnSale.map(nft => nft._id.toString());
        
        // Count all orders (open, sold, close) to show total demand/popularity
        const orderCounts = await OrderModel.aggregate([
            {
                $match: {
                    nft_id: { $in: nftIds }
                }
            },
            {
                $group: {
                    _id: "$nft_id",
                    totalOrders: { $sum: 1 },
                    openOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", constant.constant.orderStatus.open] }, 1, 0]
                        }
                    },
                    soldOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", constant.constant.orderStatus.sold] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { totalOrders: -1 }
            }
        ]);

        // Step 3: Create a map for quick lookup
        const orderCountMap = {};
        orderCounts.forEach(order => {
            orderCountMap[order._id] = {
                totalOrders: order.totalOrders,
                openOrders: order.openOrders,
                soldOrders: order.soldOrders
            };
        });

        // Step 4: Combine NFT data with order counts
        const nftsWithOrderCounts = nftsOnSale.map(nft => {
            const nftId = nft._id.toString();
            const orderStats = orderCountMap[nftId] || {
                totalOrders: 0,
                openOrders: 0,
                soldOrders: 0
            };

            return {
                ...nft,
                orderStats
            };
        });

        // Step 5: Sort by total order count (descending) and limit to top N
        const topNfts = nftsWithOrderCounts
            .sort((a, b) => b.orderStats.totalOrders - a.orderStats.totalOrders)
            .slice(0, topLimit);

        // Step 6: Fetch creator and owner profiles for top NFTs
        const uniqueUserIds = new Set();
        topNfts.forEach(nft => {
            uniqueUserIds.add(nft.user_id);
            uniqueUserIds.add(nft.current_owner);
        });

        const profiles = await ProfileModel.find({
            user_id: { $in: Array.from(uniqueUserIds) }
        })
        .select('user_id user_name first_name middle_name last_name profile_image display_name')
        .lean();

        const profileMap = {};
        profiles.forEach(profile => {
            profileMap[profile.user_id] = profile;
        });

        // Step 7: Format final response
        const formattedTopNfts = topNfts.map(nft => ({
            nft_id: nft._id,
            blockchain_token_id: nft.blockchain_token_id,
            title: nft.title,
            description: nft.description,
            resource_url: nft.resource_url,
            resource_type: nft.resource_type,
            price: nft.price,
            status: nft.status,
            on_sale: nft.on_sale,
            creator: {
                user_id: nft.user_id,
                username: nft.user_name,
                profile: profileMap[nft.user_id] || null
            },
            current_owner: {
                user_id: nft.current_owner,
                profile: profileMap[nft.current_owner] || null
            },
            order_statistics: {
                total_orders: nft.orderStats.totalOrders,
                open_orders: nft.orderStats.openOrders,
                sold_orders: nft.orderStats.soldOrders
            }
        }));

        return successResponse(
            res,
            true,
            InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Top NFTs"),
            200,
            {
                total_nfts_on_sale: nftsOnSale.length,
                returned_count: formattedTopNfts.length,
                topNfts: formattedTopNfts
            }
        );

    } catch (e) {
        console.log("getTopNfts error:", e);
        return errorResponse(
            res,
            e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("get top NFTs"),
            e.message ? 400 : 500
        );
    }
}

module.exports = {
    getTopNfts
};

