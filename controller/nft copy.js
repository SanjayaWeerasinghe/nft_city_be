
const { successResponse, errorResponse } = require("../utils/responses")
const { ErrorMessages } = require("../constants/errors")
const ProfileModel = require("../models/ProfileModel")
const { InfoMessages } = require("../constants/messages")
const _ = require('lodash');
const { isVideo, upload } = require("../utils/helperMethod");
const NftTokenModel = require("../models/NftTokenModel");
const OrderModel = require("../models/OrderModel");
const { Keyring } = require('@polkadot/api');
const { mnemonicValidate } = require('@polkadot/util-crypto');
const mongoose = require('mongoose');
const { register } = require("../db/users");

registerNft = async (req, res) => {
    let session = null;
    let registeredToken = null;
    let order = null;

    try {
        // Validate and parse request data
        const _body = _.pick(req.body, ['data', 'secret']);

        console.log("_body", _body.data)
        if (_body.secret.includes("string")) {
            _body.secret = JSON.parse(_body.secret).string;
        }

        if (!mnemonicValidate(_body.secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }

        const body = JSON.parse(_body.data);
        const { image: { md5, name, data } } = req.files;
        const [extension] = name.split('.').reverse();

        // Check if NFT already exists
        const isExist = await NftTokenModel.findOne({ payload: md5 });
        if (isExist) {
            return errorResponse(res, "This NFT has already been registered on platform.", 400);
        }

        // Upload file if not video
        if (!isVideo(body.uploadType)) {
            await upload({
                Key: `images/${md5}.${extension}`,
                Body: data
            });
        }

        // Get user profile and validate wallet
        const profile = await ProfileModel.findOne({ user_id: req.user.id });
        if (!profile?.public_address) {
            return errorResponse(res, "Please set your wallet before registering NFT", 400);
        }
        //check balance also here

        // Generate blockchain token ID
        const lastNft = await NftTokenModel.findOne().sort({ blockchain_token_id: -1 });
        const blockchainTokenId = lastNft ? Number(lastNft.blockchain_token_id) + 1 : 20;

        const lastOrder = await OrderModel.findOne().sort({ blockchain_order_id: -1 });
        console.log("lastOrder", lastOrder)
        const blockchainOrderId = lastOrder ? Number(lastOrder.blockchain_order_id) + 1 : 10;


        // Prepare NFT data
        const nftData = {
            user_id: req.user.id,
            user_name: req.user.user_name,
            title: body.title,
           // type: body.marketType,
            description: body.description,
            royalties: body.royalties || null,
            price: body.price || null,
            resource_url: `${md5}.${extension}`,
            resource_type: extension,
            payload: md5,
            public_address: profile.public_address,
            blockchain_token_id: blockchainTokenId,
            ...(body.properties && { properties: body.properties }),
            ...(body.alternativeText && { alternativeText: body.alternativeText })
        };

        // Start MongoDB transaction session
        session = await mongoose.startSession();
        session.startTransaction();

        // Save NFT token within transaction
        const nftTokenModel = new NftTokenModel(nftData);
        registeredToken = await nftTokenModel.save({ session });

        // Create order within the same transaction
        const orderModel = new OrderModel({
            token_id: registeredToken._id,
            user_id: req.user.id,
            blockchain_order_id: blockchainOrderId,
            status: "DRAFT"
        });

        order = await orderModel.save({ session });

        // Setup keyring and mint NFT on blockchain
        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });

        const newPair = keyring.addFromUri(_body.secret);

        const blockHash = await new Promise((resolve, reject) => {
            const transferObject = {};

            const unsubscribe = global.api.tx.nft
                .mint(newPair.address, registeredToken.blockchain_token_id, md5, md5)
                .signAndSend(newPair, (result) => {
                    const { events = [], status } = result;

                    console.log("Status:", status.toString());

                    if (status.isInBlock) {
                        transferObject.blockHash = status.asInBlock.toHex();
                        console.log("Transaction included in block:", transferObject.blockHash);
                    }

                    if (status.isFinalized) {
                        console.log("Transaction finalized");

                        events.forEach(({ event: { method, section } }) => {
                            console.log(`Event: ${section}.${method}`);

                            if (section === 'nft') {
                                transferObject.status = method === 'TokenMinted' ? 'ExtrinsicSuccess' : 'ExtrinsicFailed';
                                transferObject.data = {
                                    token_id: registeredToken._id,
                                    message: `NFT minted on the chain.`
                                };
                            }
                        });

                        // Resolve the promise - unsubscribe will be called automatically
                        resolve(transferObject);
                    }
                });
        });


        // Update NFT status if minting successful
        if (blockHash.status === 'ExtrinsicSuccess') {
            await NftTokenModel.findOneAndUpdate(
                { _id: registeredToken._id },
                {
                    nft_minted_hash: blockHash.blockHash,
                    status: "minted"
                },
                { session }
            );

            // Commit the transaction if everything is successful
            await session.commitTransaction();
        } else {
            throw new Error('NFT minting failed on blockchain');
        }

        return successResponse(res, true, InfoMessages.GENERIC.ITEM_CREATED_SUCCESSFULLY("Nft token"), 200, {
            orderId: order._id,
            tokenId: registeredToken._id,
            blockchainTokenId: registeredToken.blockchain_token_id,
            blockHash: blockHash.blockHash
        })


    } catch (e) {
        console.log("registerNft error", e.message, e);

        // Rollback the transaction if anything fails
        if (session) {
            await session.abortTransaction();
        }
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("updateWalletAddress"), e.message ? 400 : 500);
    } finally {
        // End the session
        if (session) {
            session.endSession();
        }
    }
};


addOrder = async (req, res) => {
    try {
        console.log("NFT minting called for custom pallet");

        const body = _.pick(req.body, [
            'secret',
            'orderId',
            'tokenId',
            'blockchainTokenId'
        ]);


        if (body.secret.includes("string")) {
            body.secret = JSON.parse(body.secret).string;
        }

        if (!mnemonicValidate(body.secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }
        const nftToken = await NftTokenModel.findOne({ _id: body.tokenId, user_id: req.user.id });

        if (!nftToken) return errorResponse(res, "Nft token not found", 400)
        const order = await OrderModel.findOne({ _id: body.orderId, token_id: body.tokenId });
        if (!order) return errorResponse(res, "Nft order not found", 400)



        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(body.secret);

        const blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            // Convert to BigInt to handle large numbers safely
            const price = BigInt(nftToken.price) * BigInt(1e18);
            const royaltyPercent = BigInt(nftToken.royalties) * BigInt(100);

            await global.api.tx.nft.addOrder(body.blockchainTokenId, price, order.blockchain_order_id, royaltyPercent, newPair.address)
                .signAndSend(newPair, ({ events = [], status }) => {

                    if (status.isInBlock) {

                        transferObject.blockHash = status.asInBlock.toHex();

                    } else if (status.isFinalized) {

                        events.forEach(({ phase, event: { data, method, section } }) => {
                            console.log("section", section)
                            console.log("method", method)
                            // console.log("data",data)
                            if (section == 'nft') {

                                transferObject.status = `${method}` === 'OrderAdded' ? 'ExtrinsicSuccess' : 'ExtrinsicFailed';
                                transferObject.data = {
                                    // from_base58: recipient.base58,
                                    // from_evm: recipient.evm,
                                    message: `NFT Order added on the chain.`
                                }
                                // transferObject.timestamp = parseInt(now)
                                // transferObject.formatedTime = time.timestampToDate(parseInt(now))
                            }
                        });
                        return resolve(transferObject);
                    }
                });
        });

        if (blockHash.status === 'ExtrinsicSuccess') {

            await OrderModel.findOneAndUpdate(
                { _id: body.orderId },
                {
                    orderHash: blockHash.blockHash,
                    status: "OPEN",
                },
            )
            await NftTokenModel.findOneAndUpdate(
                { _id: body.tokenId },
                {
                    on_sale: true,
                    status: "LISTED"
                },
            )
        }

        return successResponse(res, true, InfoMessages.GENERIC.ITEM_CREATED_SUCCESSFULLY("Nft Ordrer"), 200, {
            orderHash: blockHash.blockHash,
            orderTokenID: body.tokenId
        })



    } catch (e) {
        console.log(e);
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("Minted nft"), e.message ? 400 : 500);
    }
}







getUserTokensOnSale = async (req, res) => {
    try {
        // Get validated and converted values from middleware
        const { page = 1, itemsPerPage = 1 } = req.query;

        const skip = (page - 1) * itemsPerPage;

        // Get user's tokens that are on sale
        const tokensOnSale = await NftTokenModel.find({
            user_id: req.user.id,
            on_sale: true
        })
            .skip(skip)
            .limit(itemsPerPage)
            .sort({ 'timestamps.created_At': -1 }); // Most recent first

        // Get order details for each token
        const tokensWithOrders = await Promise.all(
            tokensOnSale.map(async (token) => {
                const order = await OrderModel.findOne({
                    token_id: token._id.toString(),
                    status: 'OPEN'
                });

                return {
                    token_id: token._id,
                    title: token.title,
                    description: token.description,
                    price: token.price,
                    royalties: token.royalties,
                    resource_url: token.resource_url,
                    resource_type: token.resource_type,
                    properties: token.properties,
                    alternativeText: token.alternativeText,
                    status: token.status,
                    blockchain: token.blockchain,
                    contract_address: token.contract_address,
                    nft_minted_hash: token.nft_minted_hash,
                    created_at: token.timestamps.created_At,
                    updated_at: token.timestamps.updated_At,
                    order_id: order ? order._id : null,
                    order_hash: order ? order.orderHash : null,
                    order_status: order ? order.status : null,
                    order_created_at: order ? order.timestamps.created_At : null
                };
            })
        );

        // Get total count for pagination info
        const totalCount = await NftTokenModel.countDocuments({
            user_id: req.user.id,
            on_sale: true
        });

        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const paginationInfo = {
            current_page: page,
            items_per_page: itemsPerPage,
            total_items: totalCount,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_previous_page: page > 1
        };

        return successResponse(res, true, "User tokens on sale retrieved successfully", 200, {
            tokens: tokensWithOrders,
            pagination: paginationInfo
        });

    } catch (e) {
        console.log("getUserTokensOnSale error", e.message);
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("getUserTokensOnSale"), e.message ? 400 : 500);
    }
};

module.exports = {
    registerNft,
    addOrder,
    getUserTokensOnSale
}
