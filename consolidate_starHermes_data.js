// consolidate_maia_data.js
const fs = require('fs');
const path = require('path');
const JSBI = require('jsbi');

const INPUT_JSONS_DIR = 'input_jsons';
const OUTPUT_DIR = 'consolidated_output';
const TOKEN_ADDRESS = '0xaFF73f55968Ab4b276a26E574c96e09A615b13d6'; // starHermes token address

// Try to load existing data from hermes.json if it exists
let results = {};
const outputFilePath = path.join(OUTPUT_DIR, 'bHermes.json');
if (fs.existsSync(outputFilePath)) {
    results = JSON.parse(fs.readFileSync(outputFilePath));
}

// Read and process totals.json
const totalsData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, 'totals.json')));
const tokenHolders = totalsData[TOKEN_ADDRESS];
Object.keys(tokenHolders).forEach(addr => {

    // Check if the address is undefined or not a valid string
    if (typeof addr !== 'string' || !addr) {
        throw new Error("Address is undefined or not valid.");
    }

    if (!results[addr]) {
        results[addr] = { balance: JSBI.BigInt(0) };
    }
    if (JSBI.greaterThan(tokenHolders[addr], JSBI.BigInt(0))) {
        results[addr]['totals.json'] = JSBI.BigInt(tokenHolders[addr]).toString()
        results[addr].balance = JSBI.add(JSBI.BigInt(results[addr].balance), JSBI.BigInt(tokenHolders[addr])).toString();
    }
});

// Read and process staked_balance.json
const stakedData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, `staked_balance_${TOKEN_ADDRESS}.json`)));
stakedData.forEach(gauge => {
    gauge.stakes.forEach(stake => {
        const addr = stake.holderAddress;

        // Check if the address is undefined or not a valid string
        if (typeof addr !== 'string' || !addr) {
            throw new Error("Address is undefined or not valid.");
        }

        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(stake.shareOfTargetToken, JSBI.BigInt(0))) {
            results[addr][`staked_balance_${TOKEN_ADDRESS}.json`] = JSBI.BigInt(stake.shareOfTargetToken).toString();
            results[addr].balance = JSBI.add(JSBI.BigInt(results[addr].balance), JSBI.BigInt(stake.shareOfTargetToken)).toString();
        }
    });
});

// Read and process pending_bribes.json
const bribesData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, `pending_bribes_${TOKEN_ADDRESS}.json`)));
bribesData.forEach(gauge => {
    gauge.rewards.forEach(reward => {
        const addr = reward.account;

        // Check if the address is undefined or not a valid string
        if (typeof addr !== 'string' || !addr) {
            throw new Error("Address is undefined or not valid.");
        }

        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(reward.pendingReward, JSBI.BigInt(0))) {
            results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`] = JSBI.BigInt(reward.pendingReward).toString();
            results[addr].balance = JSBI.add(JSBI.BigInt(results[addr].balance), JSBI.BigInt(reward.pendingReward)).toString();
        }
    });
});


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

fs.writeFileSync(path.join(OUTPUT_DIR, 'bHermes.json'), JSON.stringify(outputData, null, 2));
console.log('Maia data has been consolidated.');
