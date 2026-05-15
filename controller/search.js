const { successResponse, errorResponse } = require("../utils/responses");
const { ErrorMessages } = require("../constants/errors");
const { InfoMessages } = require("../constants/messages");
const ProfileModel = require("../models/ProfileModel");
const NftTokenModel = require("../models/NftTokenModel");

/**
 * Search for users and NFTs based on searchText
 * Searches in: blockchain_token_id, username (user_name), and NFT title
 */
async function searchUsersAndNfts(req, res) {
    try {
        const { searchText, page = 1, itemsPerPage = 20 } = req.query;
        
        // Trim and validate search text
        const trimmedSearchText = searchText.trim();
        if (!trimmedSearchText) {
            return errorResponse(res, "Search text cannot be empty", 400);
        }

        // Create regex for case-insensitive partial matching
        const searchRegex = new RegExp(trimmedSearchText, 'i');

        // Pagination
        const skip = (page - 1) * itemsPerPage;
        const limit = parseInt(itemsPerPage);

        // Search in parallel for users and NFTs
        const [users, nfts, userCount, nftCount] = await Promise.all([
            // Search users by username
            ProfileModel.find({
                user_name: searchRegex
            })
            .select('user_id user_name first_name middle_name last_name email profile_image cover_image display_name public_address')
            .skip(skip)
            .limit(limit)
            .lean(),

            // Search NFTs by blockchain_token_id or title
            NftTokenModel.find({
                $or: [
                    { blockchain_token_id: isNaN(trimmedSearchText) ? undefined : parseInt(trimmedSearchText) },
                    { title: searchRegex }
                ]
            })
            .select('_id blockchain_token_id title description resource_url resource_type price user_id user_name current_owner on_sale status')
            .skip(skip)
            .limit(limit)
            .lean(),

            // Count total matching users
            ProfileModel.countDocuments({
                user_name: searchRegex
            }),

            // Count total matching NFTs
            NftTokenModel.countDocuments({
                $or: [
                    { blockchain_token_id: isNaN(trimmedSearchText) ? undefined : parseInt(trimmedSearchText) },
                    { title: searchRegex }
                ]
            })
        ]);

        // Prepare response
        const response = {
            searchText: trimmedSearchText,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalUsers: userCount,
                totalNfts: nftCount,
                totalResults: userCount + nftCount,
                totalPages: Math.ceil((userCount + nftCount) / limit)
            },
            results: {
                users: users.map(user => ({
                    type: 'user',
                    user_id: user.user_id,
                    username: user.user_name,
                    display_name: user.display_name,
                    full_name: `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.trim(),
                    email: user.email,
                    profile_image: user.profile_image,
                    cover_image: user.cover_image,
                    public_address: user.public_address
                })),
                nfts: nfts.map(nft => ({
                    type: 'nft',
                    nft_id: nft._id,
                    blockchain_token_id: nft.blockchain_token_id,
                    title: nft.title,
                    description: nft.description,
                    resource_url: nft.resource_url,
                    resource_type: nft.resource_type,
                    price: nft.price,
                    creator_id: nft.user_id,
                    creator_username: nft.user_name,
                    current_owner: nft.current_owner,
                    on_sale: nft.on_sale,
                    status: nft.status
                }))
            }
        };

        return successResponse(
            res, 
            true, 
            InfoMessages.GENERIC.ITEM_GET_SUCCESSFULLY("Search results"), 
            200, 
            response
        );

    } catch (e) {
        console.log("searchUsersAndNfts error:", e);
        return errorResponse(
            res, 
            e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("search"), 
            e.message ? 400 : 500
        );
    }
}

module.exports = {
    searchUsersAndNfts
};

