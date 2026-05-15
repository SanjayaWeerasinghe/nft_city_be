/**
 * Test script for the Top NFTs API endpoint
 * 
 * Usage:
 * 1. Make sure your server is running
 * 2. Run: node test-top-nfts.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update if your server runs on a different port

// Test cases
const testCases = [
    {
        name: 'Get top 2 NFTs (default)',
        limit: null // Will use default (2)
    },
    {
        name: 'Get top 1 NFT',
        limit: 1
    },
    {
        name: 'Get top 5 NFTs',
        limit: 5
    },
    {
        name: 'Get top 10 NFTs',
        limit: 10
    },
    {
        name: 'Test max limit (50)',
        limit: 50
    }
];

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

async function runTest(testCase) {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}Test: ${testCase.name}${colors.reset}`);
    
    const params = {};
    if (testCase.limit !== null) {
        params.limit = testCase.limit;
        console.log(`${colors.yellow}Limit: ${testCase.limit}${colors.reset}`);
    } else {
        console.log(`${colors.yellow}Limit: Not specified (will use default)${colors.reset}`);
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/nft-service/top-nfts`, { params });

        if (response.data.success) {
            console.log(`${colors.green}✓ Test passed!${colors.reset}`);
            console.log('\nResponse:');
            console.log('─────────────────────────────────────────────');
            
            if (response.data.data.topNfts && response.data.data.topNfts.length > 0) {
                console.log(`Total NFTs on Sale: ${response.data.data.total_nfts_on_sale}`);
                console.log(`Returned Count: ${response.data.data.returned_count}`);
                console.log(`\n${colors.magenta}Top NFTs:${colors.reset}`);
                
                response.data.data.topNfts.forEach((nft, index) => {
                    console.log(`\n  ${colors.green}${index + 1}. ${nft.title}${colors.reset}`);
                    console.log(`     NFT ID: ${nft.nft_id}`);
                    console.log(`     Token ID: ${nft.blockchain_token_id}`);
                    console.log(`     Price: ${nft.price} NUC`);
                    console.log(`     Status: ${nft.status} | On Sale: ${nft.on_sale}`);
                    console.log(`     Creator: @${nft.creator.username} (ID: ${nft.creator.user_id})`);
                    console.log(`     Current Owner: ${nft.current_owner.profile ? '@' + nft.current_owner.profile.user_name : 'N/A'}`);
                    console.log(`     ${colors.yellow}📊 Order Statistics:${colors.reset}`);
                    console.log(`        Total Orders: ${nft.order_statistics.total_orders}`);
                    console.log(`        Open Orders: ${nft.order_statistics.open_orders}`);
                    console.log(`        Sold Orders: ${nft.order_statistics.sold_orders}`);
                });
            } else {
                console.log(`${colors.yellow}No NFTs currently on sale${colors.reset}`);
            }
        } else {
            console.log(`${colors.red}✗ Test failed: ${response.data.message}${colors.reset}`);
        }

    } catch (error) {
        console.log(`${colors.red}✗ Test failed with error!${colors.reset}`);
        
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Message: ${error.response.data.message || error.message}`);
            
            if (error.response.data.errors) {
                console.log('Validation errors:');
                error.response.data.errors.forEach(err => {
                    console.log(`  - ${err.msg} (${err.param})`);
                });
            }
        } else if (error.request) {
            console.log(`${colors.red}No response received. Is the server running at ${BASE_URL}?${colors.reset}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
    }
}

async function runAllTests() {
    console.log(`${colors.green}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║     Top NFTs API Endpoint Test Suite          ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\nBase URL: ${BASE_URL}`);
    console.log(`Endpoint: GET /nft-service/top-nfts`);
    console.log(`\n${colors.cyan}Testing various limit parameters...${colors.reset}`);

    for (const testCase of testCases) {
        await runTest(testCase);
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}All tests completed!${colors.reset}\n`);
    
    console.log(`${colors.cyan}💡 Tips:${colors.reset}`);
    console.log(`  - This is a public endpoint (no authentication required)`);
    console.log(`  - Only returns NFTs with status "listed" and on_sale: true`);
    console.log(`  - NFTs are ranked by total order count (popularity)`);
    console.log(`  - Limit range: 1-50 (default: 2)`);
}

// Run the tests
runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
});

