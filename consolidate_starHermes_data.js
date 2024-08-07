// consolidate_maia_data.js
const fs = require('fs');
const path = require('path');
const JSBI = require('jsbi');

const INPUT_JSONS_DIR = 'input_jsons';
const OUTPUT_DIR = 'consolidated_output';
const TOKEN_ADDRESS = '0xaFF73f55968Ab4b276a26E574c96e09A615b13d6'; // starHermes token address
const results = {};

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read and process totals.json
const totalsData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, 'totals.json')));
const tokenHolders = totalsData[TOKEN_ADDRESS];
Object.keys(tokenHolders).forEach(addr => {
    if (!results[addr]) {
        results[addr] = { balance: JSBI.BigInt(0) };
    }
    results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(tokenHolders[addr]));
});

// Read and process staked_balance.json
const stakedData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, `staked_balance_${TOKEN_ADDRESS}.json`)));
stakedData.forEach(gauge => {
    gauge.stakes.forEach(stake => {
        const addr = stake.holderAddress;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(stake.stakedBalance));
    });
});

// Read and process pending_rewards.json
const rewardsData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, `pending_rewards_${TOKEN_ADDRESS}.json`)));
rewardsData.forEach(gauge => {
    gauge.rewards.forEach(reward => {
        const addr = reward.account;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(reward.pendingReward));
    });
});

// Read and process pending_bribes.json
const bribesData = JSON.parse(fs.readFileSync(path.join(INPUT_JSONS_DIR, `pending_bribes_${TOKEN_ADDRESS}.json`)));
bribesData.forEach(gauge => {
    gauge.rewards.forEach(reward => {
        const addr = reward.account;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(reward.pendingReward));
    });
});

// Write the results to a JSON file, converting JSBI BigInts to strings for JSON serialization
const entries = Object.keys(results).map(key => ({
    address: key,
    balance: results[key].balance
}));

// Sort the entries array by balance in descending order
entries.sort((a, b) => {
    return JSBI.lessThan(JSBI.BigInt(b.balance), JSBI.BigInt(a.balance)) ? -1 : 1;
});

// Create a new object from the sorted entries
const outputData = {};
entries.forEach(entry => {
    outputData[entry.address] = { balance: entry.balance.toString() };
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'starHermes.json'), JSON.stringify(outputData, null, 2));
console.log('Maia data has been consolidated.');
