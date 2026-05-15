/**
 * Test script for the Search API endpoint
 * 
 * Usage:
 * 1. Make sure your server is running
 * 2. Update the AUTH_TOKEN variable with a valid JWT token
 * 3. Run: node test-search.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update if your server runs on a different port
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with a valid JWT token

// Test cases
const testCases = [
    {
        name: 'Search by username',
        searchText: 'john',
        page: 1,
        itemsPerPage: 10
    },
    {
        name: 'Search by NFT title',
        searchText: 'art',
        page: 1,
        itemsPerPage: 10
    },
    {
        name: 'Search by blockchain token ID',
        searchText: '12345',
        page: 1,
        itemsPerPage: 10
    },
    {
        name: 'Search with pagination - page 2',
        searchText: 'crypto',
        page: 2,
        itemsPerPage: 5
    }
];

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function runTest(testCase) {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}Test: ${testCase.name}${colors.reset}`);
    console.log(`${colors.yellow}Search Text: "${testCase.searchText}"${colors.reset}`);
    console.log(`${colors.yellow}Page: ${testCase.page}, Items per page: ${testCase.itemsPerPage}${colors.reset}`);
    
    try {
        const response = await axios.get(`${BASE_URL}/search-service/search`, {
            params: {
                searchText: testCase.searchText,
                page: testCase.page,
                itemsPerPage: testCase.itemsPerPage
            },
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        if (response.data.success) {
            console.log(`${colors.green}✓ Test passed!${colors.reset}`);
            console.log('\nResponse:');
            console.log('─────────────────────────────────────────────');
            console.log(`Total Results: ${response.data.data.pagination.totalResults}`);
            console.log(`Total Users: ${response.data.data.pagination.totalUsers}`);
            console.log(`Total NFTs: ${response.data.data.pagination.totalNfts}`);
            console.log(`Current Page: ${response.data.data.pagination.currentPage}/${response.data.data.pagination.totalPages}`);
            
            if (response.data.data.results.users.length > 0) {
                console.log('\nUsers found:');
                response.data.data.results.users.forEach((user, index) => {
                    console.log(`  ${index + 1}. @${user.username} (${user.full_name})`);
                });
            }
            
            if (response.data.data.results.nfts.length > 0) {
                console.log('\nNFTs found:');
                response.data.data.results.nfts.forEach((nft, index) => {
                    console.log(`  ${index + 1}. "${nft.title}" (Token ID: ${nft.blockchain_token_id})`);
                });
            }

            if (response.data.data.results.users.length === 0 && 
                response.data.data.results.nfts.length === 0) {
                console.log('\nNo results found.');
            }
        } else {
            console.log(`${colors.red}✗ Test failed: ${response.data.message}${colors.reset}`);
        }

    } catch (error) {
        console.log(`${colors.red}✗ Test failed with error!${colors.reset}`);
        
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Message: ${error.response.data.message || error.message}`);
            
            if (error.response.status === 401) {
                console.log(`\n${colors.yellow}⚠ Authentication error. Please update the AUTH_TOKEN variable with a valid JWT token.${colors.reset}`);
            }
            
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
    console.log(`${colors.green}║     Search API Endpoint Test Suite            ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\nBase URL: ${BASE_URL}`);
    console.log(`Endpoint: GET /search-service/search`);
    
    if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
        console.log(`\n${colors.red}⚠ WARNING: Please update the AUTH_TOKEN variable with a valid JWT token!${colors.reset}`);
        console.log(`${colors.yellow}You can get a token by logging in through the /auth-service/login endpoint.${colors.reset}\n`);
    }

    for (const testCase of testCases) {
        await runTest(testCase);
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}All tests completed!${colors.reset}\n`);
}

// Run the tests
runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
});

