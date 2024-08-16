// consolidate_hermes_data.js
const fs = require("fs");
const path = require("path");
const JSBI = require("jsbi");

const INPUT_JSON_DIR = "input_jsons";
const OUTPUT_DIR = "consolidated_output";
const TOKEN_ADDRESS = "0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8"; // hermes token address
let results = {};

// Ensure the output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read and process totals.json
const totalsData = JSON.parse(
  fs.readFileSync(path.join(INPUT_JSON_DIR, "totals.json"))
);
const tokenHolders = totalsData[TOKEN_ADDRESS];
Object.keys(tokenHolders).forEach((addr) => {
  if (!results[addr]) {
    results[addr] = { balance: "0" };
  }
  const balance = JSBI.BigInt(tokenHolders[addr]);
  if (JSBI.greaterThan(balance, JSBI.BigInt(0))) {
    results[addr]["totals.json"] = balance.toString();
    results[addr].balance = JSBI.add(
      JSBI.BigInt(results[addr].balance),
      balance
    ).toString();
  }
});

// Read and process staked_balance.json
const stakedData = JSON.parse(
  fs.readFileSync(
    path.join(INPUT_JSON_DIR, `staked_balance_${TOKEN_ADDRESS}.json`)
  )
);
stakedData.forEach((gauge) => {
  gauge.stakes.forEach((stake) => {
    const addr = stake.holderAddress;
    if (!results[addr]) {
      results[addr] = { balance: "0" };
    }
    if (!results[addr][`staked_balance_${TOKEN_ADDRESS}.json`]) {
      results[addr][`staked_balance_${TOKEN_ADDRESS}.json`] = "0";
    }
    const balance = JSBI.BigInt(stake.shareOfTargetToken);
    if (JSBI.greaterThan(balance, JSBI.BigInt(0))) {
      results[addr][`staked_balance_${TOKEN_ADDRESS}.json`] = JSBI.add(
        JSBI.BigInt(results[addr][`staked_balance_${TOKEN_ADDRESS}.json`]),
        balance
      ).toString();
      results[addr].balance = JSBI.add(
        JSBI.BigInt(results[addr].balance),
        balance
      ).toString();
    }
  });
});

// Read and process pending_rewards.json
const rewardsData = JSON.parse(
  fs.readFileSync(path.join(INPUT_JSON_DIR, `pending_rewards.json`))
);
rewardsData.forEach((gauge) => {
  gauge.rewards.forEach((reward) => {
    const addr = reward.account;
    if (!results[addr]) {
      results[addr] = { balance: "0" };
    }
    const balance = JSBI.BigInt(reward.pendingReward);
    if (JSBI.greaterThan(balance, JSBI.BigInt(0))) {
      results[addr][`pending_rewards.json - gauge:${gauge.gauge}`] =
        balance.toString();
      results[addr].balance = JSBI.add(
        JSBI.BigInt(results[addr].balance),
        balance
      ).toString();
    }
  });
});

// Read and process pending_bribes.json
const bribesData = JSON.parse(
  fs.readFileSync(
    path.join(INPUT_JSON_DIR, `pending_bribes_${TOKEN_ADDRESS}.json`)
  )
);
bribesData.forEach((gauge) => {
  gauge.rewards.forEach((reward) => {
    const addr = reward.account;
    if (!results[addr]) {
      results[addr] = { balance: "0" };
    }
    if (!results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`]) {
      results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`] = "0";
    }
    const balance = JSBI.BigInt(reward.pendingReward);
    if (JSBI.greaterThan(balance, JSBI.BigInt(0))) {
      results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`] = JSBI.add(
        JSBI.BigInt(results[addr][`pending_bribes_${TOKEN_ADDRESS}.json`]),
        balance
      ).toString();
      results[addr].balance = JSBI.add(
        JSBI.BigInt(results[addr].balance),
        balance
      ).toString();
    }
  });
});

// Write the results to a JSON file, converting JSBI BigInts to strings for JSON serialization
const entries = Object.keys(results).map((key) => ({
  address: key,
  ...results[key],
}));

// Sort the entries array by balance in descending order
entries.sort((a, b) => {
  return JSBI.lessThan(JSBI.BigInt(b.balance), JSBI.BigInt(a.balance)) ? -1 : 1;
});

// Create a new object from the sorted entries
const outputData = {};
entries.forEach((entry) => {
  outputData[entry.address] = {
    ...entry,
    balance: JSBI.BigInt(entry.balance).toString(),
  };
});

// Write the results back to the JSON file
fs.writeFileSync(
  path.join(OUTPUT_DIR, "hermes.json"),
  JSON.stringify(outputData, null, 2)
);
console.log("Hermes data has been consolidated and updated.");
