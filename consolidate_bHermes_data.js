// consolidate_hermes_data.js
const fs = require('fs');
const path = require('path');
const JSBI = require('jsbi');
const ethers = require('ethers');

const INPUT_JSON_DIR = 'input_jsons';
const OUTPUT_DIR = 'consolidated_output';
const TOKEN_ADDRESS = '0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8'; // hermes token address

// Try to load existing data from bHermes.json if it exists
let results = {};
const outputFilePath = path.join(OUTPUT_DIR, 'bHermes.json');
if (fs.existsSync(outputFilePath)) {
    results = JSON.parse(fs.readFileSync(outputFilePath));
}

// Function to update balances from locked_balances.json
function updateFromLockedBalances() {
    const lockedBalancesData = JSON.parse(fs.readFileSync(path.join(INPUT_JSON_DIR, 'locked_balances.json')));
    lockedBalancesData.forEach(entry => {
        const addr = entry.holder;

        // Check if the address is undefined or not a valid string
        if (typeof addr !== 'string' || !addr) {
            throw new Error("Address is undefined or not valid.");
        }

        const checksumAddress = ethers.utils.getAddress(addr);

        if (!results[checksumAddress]) {
            results[checksumAddress] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(entry.totalERC20, JSBI.BigInt(0))) {
            results[checksumAddress]['locked_balances.json'] = JSBI.BigInt(entry.totalERC20).toString();
            results[checksumAddress].balance = JSBI.add(JSBI.BigInt(results[checksumAddress].balance), JSBI.BigInt(entry.totalERC20)).toString();
        }
    });
}

// Call the function to process locked balances
updateFromLockedBalances();

// Write the results to a JSON file, converting JSBI BigInts to strings for JSON serialization
const entries = Object.keys(results).map(key => ({
    address: key,
    balance: results[key].balance,
    ...results[key]
}));

// Sort the entries array by balance in descending order
entries.sort((a, b) => {
    return JSBI.lessThan(JSBI.BigInt(b.balance), JSBI.BigInt(a.balance)) ? -1 : 1;
});

// Create a new object from the sorted entries
const outputData = {};
entries.forEach(entry => {
    outputData[entry.address] = { ...entry };
});

// Write the results back to the JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));
console.log('bHermes data has been consolidated and updated.');
