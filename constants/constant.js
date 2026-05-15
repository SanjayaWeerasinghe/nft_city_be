//import { consultationDurationType } from "../modules/consultations/consultations.dto"



const constant = {
    password: {
        minLength: 7,

    },
    fname: {
        minLength: 3,
        maxLength: 20,
    },
    accountName: {
        minLength: 5,

    },
    otpTokenLength: {
        minLength: 6,
        maxLength: 6,
    },
    tableName: {
        ai_kyc_document_validation_progress: "ai_kyc_document_validation_progress",
        users: "users",
        reference_user: "reference_user",
        country: "country",
        referral_transaction: "referral_transaction",
        customer_wallet: "customer_wallet",
        platform_miner: "platform_miner",
        customer_address: 'customer_address',
        customer_address_history_log: "customer_address_history_log"
    },
    website_info: {
        // name:"RentAn.AI"
        name: "Nft City",
        //supportEmail:"support@RentAn.ai",
        supportEmail: "nftCity@gmail.com"
    },
    courseFee: 2850,
    defaulPageItem: 10,
    tokenStatus: {
        "minted": "minted",
        "listed": "listed",
        "sold": "sold",
        "transferred": "transferred",
        "cancel": "cancel"
    },
    orderStatus: {
        "draft": "draft",
        "open": "open",
        "sold": "sold",
        "cancel": "cancel"
    },
    paginationDefaultValue: {
        nftHistoryDefaultItemPerPage: 20,
        nftReactionDefaultItemPerPage: 200,
        nftCommentDefaultItemPerPage: 20,
        nftListedDefaultItemPerPage: 8,
        nftOpenOrderDefaultItemPerPage: 10,
        nftCreatedByUserDefaultItemPerPage: 8,
        nftActiveOrderDefaultItemPerPage:10,
        nftMarketPlaceDefaultItemPerPage:10


    }

}



module.exports = {
    constant: constant,
}

