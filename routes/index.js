const express = require('express');
//Middleware
const { authentication } = require('../middlewares/authentication');
const { validateRequest } = require('../middlewares/validate-request')
//Validation
const { registerUserValidation, loginUserValidation, sendOtpVerificationValidation, otpVerificationValidation, recoverPasswordValidation } = require('../validation/authValidation')
const { updateWalletValidation } = require('../validation/profileValidation')
const { getUserTokensOnSaleValidation, checkMongoIDValidation, createCommentValidation, createReactionValidation, purchaseNftValidation, placeNewOrderValidation, transferNftValidation } = require('../validation/nftValidation')
const { searchValidation } = require('../validation/searchValidation')
const { getTopNftsValidation } = require('../validation/topNftValidation')
//controller
const { registerUser, loggedInUser, verifyOtpToken, recoverUserPassword, sendOtpTokenToEmail, sendUsernameToEmail } = require('../controller/auth')
const { updateWalletAddress, getOwnProfile, updateProfileCover, updateProfileInfo, getUserProfileByUsernameOrAddress, getProfileByUsername } = require('../controller/profile')
const { registerNft, addOrder, purchaseNft, placeNewOrder, transferNft, cancelOrder, getUserCollectedNfts, getUserSoldNfts, getUserActivity, getAllNftOwners } = require('../controller/nft/nft')
const { addCommentReview, getCommentsByNftId, addOrUpdateReaction, getReactionsByNftId } = require('../controller/nft/nftSocial')
const { getNftDetailByID, getNftOwnershipHistory, getNftHistoryById, getActiveOrders, getUserCreatedNfts, getCloseOrders, getCancelOrders, getAllNftsOnSale } = require('../controller/nft/fetchNft')
const { getListedTokenList, getOwnedTokenList } = require('../controller/nft/profileNft')
const { getNucBalance } = require('../controller/wallet')
const { searchUsersAndNfts } = require('../controller/search')
const { getTopNfts } = require('../controller/topNft')
const { getFile, getMultipleFiles } = require('../controller/media')
const router = express.Router();

// Auth Service
router.post("/auth-service/register", registerUserValidation(), validateRequest, registerUser);
router.post("/auth-service/login", loginUserValidation(), validateRequest, loggedInUser);
router.post("/auth-service/send-otp-token", sendOtpVerificationValidation(), validateRequest, sendOtpTokenToEmail);
router.post("/auth-service/verify-otp", otpVerificationValidation(), validateRequest, verifyOtpToken);
router.post("/auth-service/update-credential", recoverPasswordValidation(), validateRequest, recoverUserPassword);
router.post("/auth-service/forgot-username", sendUsernameToEmail);



//Profile api
router.post("/profile-service/update-wallet", authentication, updateWalletValidation(), validateRequest, updateWalletAddress);
router.get("/profile-service/profile", authentication, getOwnProfile);
router.post("/profile-service/upload-cover", authentication, updateProfileCover);
router.post("/profile-service/update-profile", authentication, updateProfileInfo);
router.post("/profile-service/profile/usernameOrAddress", authentication, getUserProfileByUsernameOrAddress);
router.get("/profile-service/profile-by-username", getProfileByUsername);


//Wallet service
router.get("/wallet-service/nuc-balance", authentication, getNucBalance);

// Search Service
router.get("/search-service/search", searchValidation(), validateRequest, searchUsersAndNfts);

// Media Service - Get presigned URLs for S3 files
router.get("/media-service/file", getFile);
router.post("/media-service/files", getMultipleFiles);


// nft service post route
router.post("/nft-service/register", authentication, registerNft);
router.post("/nft-service/addOrder", authentication, addOrder);
router.post("/nft-service/transfer-nft", authentication, transferNftValidation(), validateRequest, transferNft);
router.post("/nft-service/purchase-nft", authentication, purchaseNftValidation(), validateRequest, purchaseNft);
router.post("/nft-service/place-new-order", authentication, placeNewOrderValidation(), validateRequest, placeNewOrder);
router.post("/nft-service/cancel-order", authentication, purchaseNftValidation(), validateRequest, cancelOrder);
// NFT GET routes
router.get("/nft-service/nft-detail/:id", checkMongoIDValidation(), validateRequest, authentication, getNftDetailByID);
router.get("/nft-service/nft-history/:id", authentication, checkMongoIDValidation(), getUserTokensOnSaleValidation(), validateRequest, getNftHistoryById);
router.get("/nft-service/nft-ownership-history/:id", checkMongoIDValidation(), validateRequest, getNftOwnershipHistory);
router.get("/nft-service/active-orders", authentication, getUserTokensOnSaleValidation(), validateRequest, getActiveOrders);
router.get("/nft-service/close-orders", authentication, getUserTokensOnSaleValidation(), validateRequest, getCloseOrders);
router.get("/nft-service/cancel-orders", authentication, getUserTokensOnSaleValidation(), validateRequest, getCancelOrders);
router.get("/nft-service/marketplace", getUserTokensOnSaleValidation(), validateRequest, getAllNftsOnSale);
router.get("/nft-service/top-nfts", getTopNftsValidation(), validateRequest, getTopNfts);
// Comments & Reactions(nft social)
router.post("/nft-service/comment/:id", authentication, createCommentValidation(), validateRequest, addCommentReview);
router.get("/nft-service/comment/:id", authentication, checkMongoIDValidation(), getUserTokensOnSaleValidation(), validateRequest, getCommentsByNftId);
router.post("/nft-service/reaction/:id", authentication, createReactionValidation(), validateRequest, addOrUpdateReaction);
router.get("/nft-service/reaction/:id", authentication, checkMongoIDValidation(), getUserTokensOnSaleValidation(), validateRequest, getReactionsByNftId);
//Profile nft list
router.get("/nft-service/listed-token-list", authentication, getUserTokensOnSaleValidation(), validateRequest, getListedTokenList);
router.get("/nft-service/owned-token-list", authentication, getUserTokensOnSaleValidation(), validateRequest, getOwnedTokenList);
router.get("/nft-service/created-nfts", authentication, getUserTokensOnSaleValidation(), validateRequest, getUserCreatedNfts);
// extras
router.get("/nft-service/collected-nfts", authentication, getUserTokensOnSaleValidation(), validateRequest, getUserCollectedNfts);
router.get("/nft-service/sold-nfts", authentication, getUserTokensOnSaleValidation(), validateRequest, getUserSoldNfts);
router.get("/nft-service/all-owners", getUserTokensOnSaleValidation(), validateRequest, getAllNftOwners);
router.get("/nft-service/user-activity", authentication, getUserTokensOnSaleValidation(), validateRequest, getUserActivity);

module.exports = router;
