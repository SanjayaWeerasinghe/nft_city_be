const { query } = require("express-validator");

const getTopNftsValidation = () => [
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit must be between 1 and 50")
        .toInt()
];

module.exports = {
    getTopNftsValidation
};

