// consolidate_hermes_data.js
const fs = require('fs');
const path = require('path');
const JSBI = require('jsbi');

const INPUT_JSON_DIR = 'input_jsons';
const OUTPUT_DIR = 'consolidated_output';
const TOKEN_ADDRESS = '0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8'; // hermes token address
let results = {};

// Ensure the output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read and process totals.json
const totalsData = JSON.parse(fs.readFileSync(path.join(INPUT_JSON_DIR, 'totals.json')));
const tokenHolders = totalsData[TOKEN_ADDRESS];
Object.keys(tokenHolders).forEach(addr => {
    if (!results[addr]) {
        results[addr] = { balance: JSBI.BigInt(0) };
    }
    if (JSBI.greaterThan(tokenHolders[addr], JSBI.BigInt(0))) {
        results[addr]['totals.json'] = JSBI.BigInt(tokenHolders[addr]).toString();
        results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(tokenHolders[addr]))
    }
});

// Read and process staked_balance.json
const stakedData = JSON.parse(fs.readFileSync(path.join(INPUT_JSON_DIR, `staked_balance_${TOKEN_ADDRESS}.json`)));
stakedData.forEach(gauge => {
    gauge.stakes.forEach(stake => {
        const addr = stake.holderAddress;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(stake.stakedBalance, JSBI.BigInt(0))) {
            results[addr][`staked_balance_${TOKEN_ADDRESS}.json`] = JSBI.BigInt(stake.stakedBalance).toString();
            results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(stake.stakedBalance));
        }
    });
});

// Read and process pending_rewards.json
const rewardsData = JSON.parse(fs.readFileSync(path.join(INPUT_JSON_DIR, `pending_rewards_${TOKEN_ADDRESS}.json`)));
rewardsData.forEach(gauge => {
    gauge.rewards.forEach(reward => {
        const addr = reward.account;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(reward.pendingReward, JSBI.BigInt(0))) {
            results[addr][`pending_rewards_${TOKEN_ADDRESS}.json`] = JSBI.BigInt(reward.pendingReward).toString();
            results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(reward.pendingReward));
        }
    });
});

// Read and process pending_bribes.json
const bribesData = JSON.parse(fs.readFileSync(path.join(INPUT_JSON_DIR, `pending_bribes_${TOKEN_ADDRESS}.json`)));
bribesData.forEach(gauge => {
    gauge.rewards.forEach(reward => {
        const addr = reward.account;
        if (!results[addr]) {
            results[addr] = { balance: JSBI.BigInt(0) };
        }
        if (JSBI.greaterThan(reward.pendingReward, JSBI.BigInt(0))) {
            results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`] = JSBI.BigInt(reward.pendingReward).toString();
            results[addr].balance = JSBI.add(results[addr].balance, JSBI.BigInt(reward.pendingReward));
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
    outputData[entry.address] = { ...entry, balance: JSBI.BigInt(entry.balance).toString() };
});

// Write the results back to the JSON file
fs.writeFileSync(path.join(OUTPUT_DIR, 'hermes.json'), JSON.stringify(outputData, null, 2));
console.log('Hermes data has been consolidated and updated.');
