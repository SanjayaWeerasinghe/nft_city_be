
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

registerNft = async (req, res) => {
    let session = null;

    try {

        // Validate and parse request data
        const _body = _.pick(req.body, ['data', 'secret']);

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
            try {
                await upload({ Key: `images/${md5}.${extension}`, Body: data });
            } catch (uploadError) {
                return errorResponse(res, "Failed to upload NFT image", 500);
            }
        }

        else {
            try {
                await upload({ Key: `videos/${md5}.${extension}`, Body: data })
            } catch (uploadError) {
                console.log("uploadError", uploadError)
                return errorResponse(res, "Failed to upload NFT video", 500);
            }
        }


        // Get user profile and validate wallet
        const profile = await ProfileModel.findOne({ user_id: req.user.id });
        if (!profile?.public_address) {
            return errorResponse(res, "Please set your wallet before registering NFT", 400);
        }
        //check balance also here

        // Generate blockchain token and order IDs safely
        const nftCounter = await CounterModel.findOneAndUpdate(
            { key: "nft_token_id" },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );
        const blockchainTokenId = nftCounter.value;

        const orderCounter = await CounterModel.findOneAndUpdate(
            { key: "order_id" },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );
        const blockchainOrderId = orderCounter.value;

        // Prepare NFT data
        const nftData = {
            user_id: req.user.id,
            user_name: req.user.user_name,
            title: body.title,
            current_owner: req.user.id,
            description: body.description,
            royalties: body.royalties || null,
            price: body.price ? Number(body.price) : null,
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
        let nftToken = await nftTokenModel.save({ session });
        // Create order within the same transaction
        const orderModel = new OrderModel({
            nft_id: nftToken._id,
            user_id: req.user.id,
            blockchain_order_id: blockchainOrderId,
            status: constant.constant.orderStatus.draft,
            price: body.price || null,
        });

        let order = await orderModel.save({ session });

        //  Setup keyring and mint NFT on blockchain
        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });

        const newPair = keyring.addFromUri(_body.secret);
        console.log("newPair.address", newPair.address)

        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler

            try {
                unsub = await global.api.tx.nft
                    .mint(newPair.address, nftToken.blockchain_token_id, md5, md5)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                const { method, section, data } = event;
                                console.log("Event register nft:", method, section);

                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "NFT minted failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);
                                            const { docs } = decoded;
                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "TokenMinted") {
                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.message = "NFT minted success"
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });


        //  const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");

        // let blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };
        console.log("nft minted blockHash", blockHash)

        // Update NFT status if minting successful
        if (blockHash.status === 'ExtrinsicSuccess') {

            await NftTokenModel.findOneAndUpdate(
                { _id: nftToken._id },
                {
                    nft_minted_hash: blockHash.blockHash,
                    status: constant.constant.tokenStatus.minted
                },
                { session }
            );
            const historyModel = new NftHistoryModel({
                nft_id: nftToken._id,
                token_id: nftToken.blockchain_token_id.toString(),
                action: constant.constant.tokenStatus.minted,
                from_user: null,              // because it’s not transferred from anyone
                to_user: req.user.id,         // because the minted NFT is owned by the minter
                tx_hash: blockHash.blockHash,
                price: body.price || null,
            });

            await historyModel.save({ session });
            // Commit the transaction if everything is successful
            await session.commitTransaction();

            return successResponse(res, true, InfoMessages.GENERIC.ITEM_CREATED_SUCCESSFULLY("Nft token"), 200, {
                orderId: order._id,
                nftId: nftToken._id,
                blockchainTokenId: nftToken.blockchain_token_id,
                blockHash: blockHash.blockHash
            })


        }
        throw new Error("Blockchain nft order failed");

    } catch (e) {
        console.log("registerNft error", e.message, e);

        // Rollback the transaction if anything fails
        if (session) {
            await session.abortTransaction();
        }
        return errorResponse(res, e.message ? e.message : ErrorMessages.GENERIC_ERROR.OPERATION_FAIL("registerNft"), e.message ? 400 : 500);
    } finally {
        // End the session
        if (session) {
            session.endSession();
        }
    }
};

// first time order creation in floe we mint nft and suddenly create order of this first time minted nft.Second time we place new order with new price.
addOrder = async (req, res) => {

    try {
        const body = _.pick(req.body, [
            'secret',
            'orderId',
            'nftId',
            'blockchainTokenId'
        ]);

        if (!mnemonicValidate(body.secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }
        //nft token exist
        const nftToken = await NftTokenModel.findOne({ _id: body.nftId, current_owner: req.user.id });

        if (!nftToken) return errorResponse(res, "Nft token not found", 400)
        const order = await OrderModel.findOne({ _id: body.orderId, nft_id: body.nftId });
        if (!order) return errorResponse(res, "Nft order not found", 400)

        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(body.secret);

        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler
            const price = BigInt(Math.floor(nftToken.price * (10 ** process.env.DECIMAL)));
            const royaltyPercent = BigInt(nftToken.royalties) * BigInt(100);



            try {
                unsub = await global.api.tx.nft
                    .addOrder(body.blockchainTokenId, price, order.blockchain_order_id, royaltyPercent, newPair.address)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }
                        console.log("Transaction status:", status);

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                console.log("Transaction event:", event);
                                const { method, section, data } = event;
                                console.log("Event order nft:", method, section);
                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "NFT order failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);

                                            const { docs } = decoded;

                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "OrderAdded") {

                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.message = "NFT order creation success"
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });

        // const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");

        // let blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };

        console.log("order nft blockHash", blockHash)
        if (blockHash.status === 'ExtrinsicSuccess') {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {

                await OrderModel.findOneAndUpdate(
                    { _id: body.orderId },
                    {
                        orderHash: blockHash.blockHash,
                        status: constant.constant.orderStatus.open
                    },
                    { session, new: true }
                )
                await NftTokenModel.findOneAndUpdate(
                    { _id: body.nftId },
                    {
                        on_sale: true,
                        status: constant.constant.tokenStatus.listed
                    },
                    { session, new: true }
                )

                const historyModel = new NftHistoryModel({
                    nft_id: nftToken._id,
                    token_id: nftToken.blockchain_token_id.toString(),
                    action: constant.constant.tokenStatus.listed,
                    from_user: req.user.id,
                    to_user: null,
                    price: nftToken.price,
                    order_id: order._id,
                    tx_hash: blockHash.blockHash,
                    blockchain: "substrate",
                });

                await historyModel.save({ session });
                await session.commitTransaction();
                return successResponse(res, true, InfoMessages.GENERIC.ITEM_CREATED_SUCCESSFULLY("NFT Order"), 200, {
                    orderHash: blockHash.blockHash,
                    orderTokenID: body.blockchainTokenId,
                })
            } catch (dbError) {
                await session.abortTransaction();
                throw dbError;
            } finally {
                session.endSession();
            }
        }
        console.log("Reached 2")
        throw new Error("Blockchain NFT order failed");

    } catch (e) {
        console.log("Reached 3", e)
        return errorResponse(res, e.message || "order nft operation fail", e.message ? 400 : 500);
    }
}


async function purchaseNft(req, res) {


    try {
        const { nftId, orderId, secret } = req.body;

        if (!mnemonicValidate(secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }

        console.log("nftIf", nftId)
        // Ensure NFT exists
        const nftToken = await NftTokenModel.findOne({ _id: nftId, on_sale: true });
        console.log("nfttoke", nftToken)

        if (!nftToken) {
            return errorResponse(res, "NFT not found for sale", 400);
        }
        // check nft order is open

        const order = await OrderModel.findOne({ _id: orderId, status: constant.constant.orderStatus.open });

        if (!order) {
            return errorResponse(res, "Open order not found", 400);
        }
        if (order.nft_id.toString() !== nftId.toString()) {
            return errorResponse(res, "NFT ID does not match the order", 400);
        }
        if (req.user.id === nftToken.current_owner) {
            return errorResponse(res, "You can not buy your own nft", 400);
        }
        if (order.user_id !== nftToken.current_owner) {
            return errorResponse(res, "Order owner doesn't match NFT owner", 400);
        }

        // const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");

        // let blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };



        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(secret);
        console.log("newPair.address", newPair.address)

        const { data: { free } } = (await global.api.query.system.account(newPair.address)).toJSON();
        let balance = parseFloat((parseInt(free) / 10 ** process.env.DECIMAL).toFixed(3))
        if (balance <= order.price) {
            return errorResponse(res, "You have insufficient balance to purchase this NFT.", 400);
        }
        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler


            try {
                console.log("order.blockchain_order_id", order.blockchain_order_id)

                unsub = await global.api.tx.nft
                    .purchaseOrder(order.blockchain_order_id)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                const { method, section, data } = event;
                                console.log("Event:", section, method);

                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "Nft purchase failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);
                                            const { docs } = decoded;
                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "OrderPurchased") {
                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.data = { message: "Nft purchase success" };
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });






        // Check if blockchain transaction failed
        if (blockHash.status === "ExtrinsicSuccess") {

            const session = await mongoose.startSession();
            session.startTransaction();
            console.log("On purchase", {
                orderHash: blockHash.blockHash,
                status: constant.constant.orderStatus.sold,
                purchasedBy: req.user.id
            }
            )

            try {
                await OrderModel.findOneAndUpdate(
                    { _id: orderId },
                    {
                        orderHash: blockHash.blockHash,
                        status: constant.constant.orderStatus.sold,
                        purchasedBy: req.user.id
                    }

                    ,
                    { session, new: true }
                )
                await NftTokenModel.findOneAndUpdate(
                    { _id: nftId },
                    {
                        on_sale: false,
                        current_owner: req.user.id,
                        previous_owner: nftToken.current_owner,
                        status: constant.constant.tokenStatus.sold,
                    },
                    { session, new: true }
                )
                const historyModel = new NftHistoryModel({
                    nft_id: nftToken._id,
                    token_id: nftToken.blockchain_token_id.toString(),
                    action: constant.constant.tokenStatus.sold,
                    from_user: nftToken.current_owner,
                    to_user: req.user.id,
                    price: nftToken.price,
                    order_id: order._id,
                    tx_hash: blockHash.blockHash,
                    blockchain: "substrate",
                });

                await historyModel.save({ session });
                await session.commitTransaction();
                return successResponse(res, true, "Nft purchase successfully", 200, { txHash: blockHash.blockHash });
            } catch (dbError) {
                await session.abortTransaction();
                throw dbError;
            } finally {
                session.endSession();
            }

        }
        throw new Error("Blockchain purchase failed");

        // 4️⃣ NOW start DB transaction (only after blockchain succeeds)

    } catch (e) {

        return errorResponse(res, e.message || "Fail to purchase nft", e.message ? 400 : 500);
    }
}



async function placeNewOrder(req, res) {

    try {
        const { nftId, price, secret } = req.body; // include price for new listing

        if (!mnemonicValidate(secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }

        // 1️⃣ Validate NFT ownership and ensure it's not already on sale
        const nftToken = await NftTokenModel.findOne({
            _id: nftId,
            current_owner: req.user.id,
            on_sale: false,
        });

        if (!nftToken) {
            return errorResponse(res, "NFT not found or already listed for sale", 400);
        }

        // 2️⃣ Ensure no open order already exists
        const existingOrder = await OrderModel.findOne({
            nft_id: nftId,
            status: constant.constant.orderStatus.open,
        });

        if (existingOrder) {
            return errorResponse(res, "An open order already exists for this NFT", 400);
        }

        const orderCounter = await CounterModel.findOneAndUpdate(
            { key: "order_id" },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        const blockchainOrderId = orderCounter.value;
        console.log("blockchainOrderId checkingg", blockchainOrderId)


        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(secret);

        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler
            const newPrice = BigInt(Math.floor(price * (10 ** process.env.DECIMAL)));
            const royaltyPercent = BigInt(nftToken.royalties) * BigInt(100);



            try {
                unsub = await global.api.tx.nft
                    .addOrder(nftToken.blockchain_token_id, newPrice, blockchainOrderId, royaltyPercent, newPair.address)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                const { method, section, data } = event;
                                console.log("Event:", section, method);

                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "Blockchain listing failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);
                                            const { docs } = decoded;
                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "OrderAdded") {
                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.data = { message: "Blockchain listing success" };
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });







        // // 3️⃣ Create unique blockchain order hash (mocked)
        // const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");

        // const blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };

        // 4️⃣ Proceed only if blockchain simulation succeeded
        if (blockHash.status === "ExtrinsicSuccess") {

            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // Generate new order counter

                console.log("blockchainOrderId", blockchainOrderId)

                // 5️⃣ Create new order for re-listing
                const newOrder = new OrderModel({
                    nft_id: nftToken._id,
                    user_id: req.user.id,
                    blockchain_order_id: blockchainOrderId,
                    price: price || nftToken.price, // allow new price or reuse old one
                    orderHash: blockHash.blockHash,
                    status: constant.constant.orderStatus.open,
                }
                );

                await newOrder.save({ session });

                // 6️⃣ Update NFT status to “listed” again
                await NftTokenModel.findByIdAndUpdate({ _id: nftId }, {
                    on_sale: true,
                    status: constant.constant.tokenStatus.listed,
                    price: price || nftToken.price, // update NFT price to new value
                },
                    { session, new: true }
                );

                // 7️⃣ Record listing in NFT history
                const historyModel = new NftHistoryModel({
                    nft_id: nftToken._id,
                    token_id: nftToken.blockchain_token_id.toString(),
                    action: constant.constant.tokenStatus.listed,
                    from_user: req.user.id,
                    to_user: null, // no buyer yet
                    price: price || nftToken.price,
                    order_id: newOrder._id,
                    tx_hash: blockHash.blockHash,
                    blockchain: "substrate",
                });

                await historyModel.save({ session });
                await session.commitTransaction();
                return successResponse(res, true, "NFT order placed successfully", 200, { txHash: blockHash.blockHash, price: price });


            } catch (dbError) {
                await session.abortTransaction();
                throw dbError;
            } finally {
                session.endSession();
            }
        }

        throw new Error("Blockchain listing failed");

    } catch (e) {

        return errorResponse(res, e.message || "Fail to place New Order", e.message ? 400 : 500);

    }
}





async function transferNft(req, res) {


    try {
        console.log("I am hit brorhrhr")
        const { nftId, toUserId, secret } = req.body;

        if (!mnemonicValidate(secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }


        // 1️⃣ Validate NFT ownership
        const nftToken = await NftTokenModel.findOne({
            _id: nftId,
            current_owner: req.user.id,
        });

        if (!nftToken) {
            return errorResponse(res, "NFT not found or not owned by you", 400);
        }
        // 2️⃣ Validate target user
        const toUser = await ProfileModel.findOne({ user_id: toUserId });
        if (!toUser) {
            return errorResponse(res, "Target user not found", 400);
        }
        if (!toUser.public_address) {
            return errorResponse(res, "Recevier wallet not exist", 400);
        }
        if (toUserId == req.user.id) {
            return errorResponse(res, "Cannot transfer NFT to yourself", 400);
        }
        console.log("nftId", nftId)

        const activeOrder = await OrderModel.findOne({
            nft_id: nftId,
            status: constant.constant.orderStatus.open,
        });
        console.log("activeOrder", activeOrder)


        if (activeOrder) {
            return errorResponse(res, "NFT has an active order. Cancel the order before transferring.", 400);
        }


        // 3️⃣ Mock blockchain transaction
        // const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");
        // const blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };


        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(secret);

        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler

            try {
                unsub = await global.api.tx.nft
                    .safeTransferFrom(newPair.address, toUser.public_address, nftToken.blockchain_token_id)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                const { method, section, data } = event;
                                console.log("Event transfer nft:", section, method);

                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "NFT transfer failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);

                                            const { docs } = decoded;

                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "Transfer") {
                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.data = { message: "NFT transfer success" };
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });



        console.log("blockHash", blockHash)

        // Check if blockchain transaction failed
        if (blockHash.status === "ExtrinsicSuccess") {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {

                await NftTokenModel.findByIdAndUpdate(
                    { _id: nftId },
                    {
                        previous_owner: nftToken.current_owner,
                        current_owner: toUserId,
                        on_sale: false,
                        status: constant.constant.tokenStatus.transferred,
                    },
                    { session }
                );

                // 5️⃣ Add to history
                const historyModel = new NftHistoryModel({
                    nft_id: nftToken._id,
                    token_id: nftToken.blockchain_token_id.toString(),
                    action: constant.constant.tokenStatus.transferred,
                    from_user: req.user.id,
                    to_user: toUserId,
                    price: nftToken.price,
                    tx_hash: blockHash.blockHash,
                    blockchain: "substrate",
                });

                await historyModel.save({ session });
                await session.commitTransaction();
                return successResponse(res, true, "NFT transferred successfully", 200, {
                    txHash: blockHash.blockHash,
                });
            } catch (dbError) {
                await session.abortTransaction();
                throw dbError;
            } finally {
                session.endSession();
            }
        }

        throw new Error("NFT transfer failedsssss");


    } catch (e) {
        console.log("Final error", e)
        return errorResponse(res, e.message || "NFT transfer failedsss riyananan", e.message ? 400 : 500);
    }
}

async function cancelOrder(req, res) {

    try {
        const { nftId, orderId, secret } = req.body;

        if (!mnemonicValidate(secret)) {
            return errorResponse(res, "Invalid Mnemonic", 400);
        }
        // 1️⃣ Validate NFT ownership
        const nftToken = await NftTokenModel.findOne({
            _id: nftId,
            current_owner: req.user.id,
        });
        console.log("nftToken", orderId, constant.constant.orderStatus.open)

        if (!nftToken) {
            return errorResponse(res, "NFT not found or not owned by you", 400);
        }

        // 2️⃣ Ensure no open order already exists
        const existingOrder = await OrderModel.findOne({
            _id: orderId,
            status: constant.constant.orderStatus.open
        });

        if (!existingOrder) {
            return errorResponse(res, "No open order found", 400);
        }

        if (existingOrder.nft_id !== nftId) {
            return errorResponse(res, "Order doesn't belong to this NFT", 400);
        }

        const keyring = new Keyring({
            type: 'sr25519',
            ss58Format: 42,
        });
        const newPair = keyring.addFromUri(secret);

        let blockHash = await new Promise(async (resolve, reject) => {
            const transferObject = {};
            let finalized = false; // prevent multiple resolve/reject calls
            let unsub; // store unsubscribe handler

            try {
                unsub = await global.api.tx.nft
                    .cancelOrder(existingOrder.blockchain_order_id)
                    .signAndSend(newPair, (result) => {

                        const { events = [], status } = result;
                        // When transaction enters a block
                        if (status.isInBlock) {
                            transferObject.blockHash = status.asInBlock.toHex();
                            console.log("Transaction included in block:", transferObject.blockHash);
                        }

                        // When transaction is finalized
                        if (status.isFinalized && !finalized) {
                            finalized = true;
                            // Process blockchain events
                            events.forEach(({ event, phase }) => {
                                const { method, section, data } = event;
                                console.log("Event:", section, method);

                                if (section === "system" && method === "ExtrinsicFailed") {
                                    let errorMessage = "NFT cancel order failed";
                                    try {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            const decoded = global.api.registry.findMetaError(dispatchError.asModule);

                                            const { docs } = decoded;

                                            errorMessage = `${docs.join(" ")}`;
                                        } else {

                                            errorMessage = dispatchError.toString();
                                        }
                                    } catch (decodeErr) {
                                        console.error("Error decoding dispatch error:", decodeErr);
                                    }

                                    transferObject.status = "ExtrinsicFailed";
                                    transferObject.message = errorMessage

                                    if (unsub) unsub(); // clean up listener
                                    reject(transferObject);
                                }

                                else if (section === "nft" && method === "OrderCancelled") {
                                    transferObject.status = "ExtrinsicSuccess";
                                    transferObject.data = { message: "NFT order cancelled success" };
                                    if (unsub) unsub(); // clean up listener
                                    resolve(transferObject);
                                }
                            });
                        }
                    });
            } catch (error) {
                console.error("RPC signAndSend error:", error.message);
                if (unsub) unsub();
                reject({
                    status: "RpcError",
                    message: error.message,
                });
            }
        });



        // 3️⃣ Create unique blockchain order hash (mocked)
        // const randomBlockHash = "0x" + crypto.randomBytes(32).toString("hex");

        // const blockHash = {
        //     status: "ExtrinsicSuccess",
        //     blockHash: randomBlockHash,
        // };

        // 4️⃣ Proceed only if blockchain simulation succeeded
        if (blockHash.status === "ExtrinsicSuccess") {

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 6️⃣ Update NFT status to “listed” again
                await OrderModel.findByIdAndUpdate({ _id: orderId }, {
                    status: constant.constant.orderStatus.cancel,

                }, { session });
                await NftTokenModel.findByIdAndUpdate(
                    { _id: nftId },
                    {
                        status: constant.constant.tokenStatus.cancel,
                        on_sale: false
                    },
                    { session }
                );

                // 7️⃣ Record listing in NFT history
                const historyModel = new NftHistoryModel({
                    nft_id: nftToken._id,
                    token_id: nftToken.blockchain_token_id.toString(),
                    from_user: req.user.id,
                    to_user: null, // no buyer yet
                    order_id: orderId,
                    tx_hash: blockHash.blockHash,
                    blockchain: "substrate",
                    action: constant.constant.tokenStatus.cancel,
                });

                await historyModel.save({ session });
                await session.commitTransaction();

                return successResponse(res, true, "NFT order cancel successfully", 200, {
                    txHash: blockHash.blockHash,
                });
            } catch (dbError) {
                await session.abortTransaction();
                throw dbError;
            } finally {
                session.endSession();
            }
        }

        throw new Error("NFT order cancel failed");
    } catch (e) {
        return errorResponse(res, e.message || "NFT order canceld failed", e.message ? 400 : 500);
    }
}




















async function getUserCollectedNfts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 20;
        const skip = (page - 1) * itemsPerPage;

        // Get NFTs owned by user (but not created by them)
        const query = {
            current_owner: req.user.id,
            //user_id: { $ne: req.user.id }, // Not created by this user
        };

        const totalCount = await NftTokenModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const nfts = await NftTokenModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with creator details
        const enrichedNfts = await Promise.all(
            nfts.map(async (nft) => {
                const creatorProfile = await ProfileModel.findOne({ user_id: nft.user_id })
                    .select('user_id display_name user_name profile_image')
                    .lean();

                return {
                    ...nft,
                    creator_details: creatorProfile
                };
            })
        );

        return successResponse(res, true, "Collected NFTs retrieved successfully", 200, {
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
        console.log("getUserCollectedNfts error:", error);
        return errorResponse(res, error.message || "Failed to retrieve collected NFTs", 500);
    }
}



async function getUserSoldNfts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 20;
        const skip = (page - 1) * itemsPerPage;

        // Get NFTs where user was the seller
        const query = {
            user_id: req.user.id,
            status: constant.constant.tokenStatus.sold,
            current_owner: { $ne: req.user.id } // Now owned by someone else
        };

        const totalCount = await NftTokenModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const nfts = await NftTokenModel.find(query)
            .select('-__v')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with buyer details
        const enrichedNfts = await Promise.all(
            nfts.map(async (nft) => {
                const buyerProfile = await ProfileModel.findOne({ user_id: nft.current_owner })


                // Get the sale history record
                const saleRecord = await NftHistoryModel.findOne({
                    nft_id: nft._id,
                    action: constant.constant.tokenStatus.sold,
                    to_user: nft.current_owner
                })

                return {
                    ...nft,
                    buyer_details: buyerProfile,
                    sale_details: saleRecord
                };
            })
        );

        return successResponse(res, true, "Sold NFTs retrieved successfully", 200, {
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
        console.log("getUserSoldNfts error:", error);
        return errorResponse(res, error.message || "Failed to retrieve sold NFTs", 500);
    }
}

async function getUserActivity(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 30;
        const skip = (page - 1) * itemsPerPage;

        // Get all activity where user was involved (from or to)
        const query = {
            $or: [
                { from_user: req.user.id },
                { to_user: req.user.id }
            ]
        };

        const totalCount = await NftHistoryModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const activities = await NftHistoryModel.find(query)
            .select('-__v')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean();

        // Enrich with NFT and user details
        const enrichedActivities = await Promise.all(
            activities.map(async (activity) => {
                const nft = await NftTokenModel.findOne({ _id: activity.nft_id })


                let fromUserProfile = null;
                let toUserProfile = null;

                if (activity.from_user && activity.from_user !== req.user.id) {
                    fromUserProfile = await ProfileModel.findOne({ user_id: activity.from_user })

                }

                if (activity.to_user && activity.to_user !== req.user.id) {
                    toUserProfile = await ProfileModel.findOne({ user_id: activity.to_user })

                }

                return {
                    ...activity,
                    nft_details: nft,
                    from_user_details: fromUserProfile,
                    to_user_details: toUserProfile
                };
            })
        );

        return successResponse(res, true, "User activity retrieved successfully", 200, {
            activities: enrichedActivities,
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
        console.log("getUserActivity error:", error);
        return errorResponse(res, error.message || "Failed to retrieve user activity", 500);
    }
}



async function getAllNftOwners(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 20;
        const skip = (page - 1) * itemsPerPage;

        // Aggregate to get unique current owners and their NFT counts
        const ownerStats = await NftTokenModel.aggregate([
            {
                $group: {
                    _id: "$current_owner",
                    nft_count: { $sum: 1 },
                    nfts_on_sale: {
                        $sum: { $cond: [{ $eq: ["$on_sale", true] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { nft_count: -1 } // Sort by number of NFTs owned
            }
        ]);

        const totalCount = ownerStats.length;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // Paginate the results
        const paginatedOwnerStats = ownerStats.slice(skip, skip + itemsPerPage);

        // Enrich with profile details
        const enrichedOwners = await Promise.all(
            paginatedOwnerStats.map(async (ownerStat) => {
                const profile = await ProfileModel.findOne({ user_id: ownerStat._id })
                    .select('user_id display_name user_name profile_image profile_cover bio public_address')
                    .lean();

                return {
                    user_id: ownerStat._id,
                    nft_count: ownerStat.nft_count,
                    nfts_on_sale: ownerStat.nfts_on_sale,
                    profile: profile || null
                };
            })
        );

        return successResponse(res, true, "NFT owners retrieved successfully", 200, {
            owners: enrichedOwners,
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
        console.log("getAllNftOwners error:", error);
        return errorResponse(res, error.message || "Failed to retrieve NFT owners", 500);
    }
}




module.exports = {
    registerNft,
    addOrder,
    purchaseNft,
    placeNewOrder,
    transferNft,
    cancelOrder,
    getUserCollectedNfts,
    getUserSoldNfts,
    getUserActivity,
    getAllNftOwners,
}
