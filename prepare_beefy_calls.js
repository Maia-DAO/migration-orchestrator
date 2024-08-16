const { ethers } = require("ethers");
const fs = require("fs");
const csv = require("csv-parser");
const JSBI = require("jsbi");

// Setup ethers provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://metis-mainnet.g.alchemy.com/v2/FWmhvca-2KGl6D1o9YcToyEeO8Lmshcy"
);

const MIGRATION_BLOCK = 18097914;

const voterAddress = "0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F";
const multicallAddress = "0x5D78bF8f79A66e43f5932c1Ae0b8fA6563F97f74";

const tokenList = [
  "0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD",
  "0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8",
];

const vaults = [
  "0xb555E8822B53740aAdbEC49eAc8D6ca7fe6E2548",
  "0xdF1251486F7F894eA521A6e9584A2683C16487f0",
];

const strategies = [
  "0x8e4E18Fd60C584945Beb6BA08771520455DfcAE4",
  "0x438a7172Ed1f444A8Cf1f1642179211E6a6D1d2e",
];

const decimals = [1e9, 1e18];

const creationBlocks = [3663291, 3663661];

const inputFiles = [
  "./consolidated_output/maia_calls.csv",
  "./consolidated_output/hermes_calls.csv",
];

const balanceInputFiles = [
  "./input_jsons/staked_balance_0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD.json",
  "./input_jsons/staked_balance_0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8.json",
];

const outputFiles = [
  "./consolidated_output/maia_and_beefy_calls.csv",
  "./consolidated_output/hermes_and_beefy_calls.csv",
];

const stakeOutputFiles = [
  "./consolidated_output/staked_balance_maia_beefy.json",
  "./consolidated_output/staked_balance_hermes_beefy.json",
];

const rewardsOutputFile = "./consolidated_output/beefy_rewards.json";

const MOO_ABI = [
  {
    inputs: [
      {
        internalType: "contract IStrategy",
        name: "_strategy",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_approvalDelay",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "NewStratCandidate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "UpgradeStrat",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "approvalDelay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "available",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "balance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "earn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPricePerFullShare",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "inCaseTokensGetStuck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_implementation",
        type: "address",
      },
    ],
    name: "proposeStrat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stratCandidate",
    outputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "proposedTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "strategy",
    outputs: [
      {
        internalType: "contract IStrategy",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "upgradeStrat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "want",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_shares",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const MULTICALL_ABI = [
  {
    constant: true,
    inputs: [
      {
        components: [
          {
            name: "target",
            type: "address",
          },
          {
            name: "callData",
            type: "bytes",
          },
        ],
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      {
        name: "blockNumber",
        type: "uint256",
      },
      {
        name: "returnData",
        type: "bytes[]",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const rewardsAmount = [];
const rewards = {};

async function main() {
  // Read and process pending_rewards.json
  const rewardsData = JSON.parse(
    fs.readFileSync(`./input_jsons/pending_rewards.json`)
  );
  rewardsData.forEach((gauge) => {
    gauge.rewards.forEach((reward) => {
      const addr = reward.account;

      if (addr === strategies[0]) {
        rewardsAmount[0] = reward.pendingReward / 1e18;
        console.log("FOUND MAIA LP VAULT REWARDS", rewardsAmount[0]);
      } else if (addr === strategies[1]) {
        rewardsAmount[1] = reward.pendingReward / 1e18;
        console.log("FOUND HERMES LP VAULT REWARDS", rewardsAmount[1]);
      }
    });
  });

  for (let i = 0; i < tokenList.length; i++) {
    const balanceInputFile = balanceInputFiles[i];
    const vaultAddress = vaults[i];
    const strategyAddress = strategies[i].toString();
    const creationBlock = creationBlocks[i];
    const block = await provider.getBlockNumber();

    console.log(
      "🚀 ~ main ~ strategyAddress:",
      balanceInputFile,
      strategyAddress
    );

    const Vault = new ethers.Contract(vaultAddress, MOO_ABI, provider);

    const accounts = await getHolders(Vault, creationBlock, block);

    let balance;
    // Read and process staked_balance.json
    const stakedData = JSON.parse(fs.readFileSync(balanceInputFile));
    stakedData.forEach((gauge) => {
      gauge.stakes.forEach((stake) => {
        const addr = stake.holderAddress.toString();
        if (
          addr.trim().toLowerCase() === strategyAddress.trim().toLowerCase()
        ) {
          balance = stake.shareOfTargetToken;
        }
      });
    });

    if (!balance) {
      console.log("FAILED", balance);
      continue;
    }

    console.log("🚀 ~ main ~ balance:", balance);

    const Multicall = new ethers.Contract(
      multicallAddress,
      MULTICALL_ABI,
      provider
    );

    await processTokenBalancesAndShares(
      Multicall,
      accounts,
      vaultAddress,
      balance,
      i
    );
  }

  console.log("Saving rewards...");
  fs.writeFileSync(rewardsOutputFile, JSON.stringify(rewards));
  console.log("Done.");
}

async function batchMulticall(Multicall, calls) {
  const BATCH_SIZE = 500;
  let results = [];

  for (let i = 0; i < calls.length; i += BATCH_SIZE) {
    console.log("🚀 ~ batchMulticall ~ calls:", i, i + BATCH_SIZE);
    const batchCalls = calls.slice(i, i + BATCH_SIZE);
    const { returnData } = await Multicall.aggregate(batchCalls, {
      blockTag: MIGRATION_BLOCK,
    });
    // console.log("🚀 ~ batchMulticall ~ returnData:", returnData);
    results = results.concat(returnData);
  }

  return results;
}

async function getHolders(vault, fromBlock, toBlock) {
  const logs = await fetchLogsInBatches(vault, fromBlock, toBlock, 1000000);

  const ADDRESSES_TO_IGNORE = ["0x0000000000000000000000000000000000000000"];

  const uniqueAddresses = new Set();
  for (const log of logs) {
    const from = ethers.utils.getAddress("0x" + log.topics[1].slice(26));
    const to = ethers.utils.getAddress("0x" + log.topics[2].slice(26));
    if (!ADDRESSES_TO_IGNORE.includes(from)) uniqueAddresses.add(from);
    if (!ADDRESSES_TO_IGNORE.includes(to)) uniqueAddresses.add(to);
  }

  return Array.from(uniqueAddresses);
}

async function fetchLogsInBatches(vault, startBlock, endBlock, batchSize) {
  let currentBlock = startBlock;
  let allLogs = [];

  while (currentBlock <= endBlock) {
    const batchEndBlock = Math.min(currentBlock + batchSize - 1, endBlock);
    try {
      const filter = vault.filters.Transfer;
      const logs = await vault.queryFilter(filter, currentBlock, batchEndBlock);
      allLogs = allLogs.concat(logs);
      currentBlock = batchEndBlock + 1;
    } catch (error) {
      console.error("Error fetching logs:", error);
      break;
    }
  }
  return allLogs;
}

// Helper function to read CSV and process data
async function processCSV(filename) {
  // Try to load existing data from hermes.json if it exists
  let results = {};

  await new Promise((resolve) => {
    fs.createReadStream(filename)
      .pipe(
        csv({
          headers: false,
          separator: ",",
          skipLines: 0,
          trim: true,
        })
      )
      .on("data", (row) => {
        const addr = ethers.utils.getAddress(row["0"]);
        const reward = row["1"];
        if (!results[addr]) {
          results[addr] = { balance: 0 }; // Initialize with a BigInt.
        }
        try {
          const rewardToUse = parseFloat(reward || "0");

          // Check if the address is undefined or not a valid string
          if (typeof addr !== "string" || !addr) {
            throw new Error("Address is undefined or not valid.");
          }

          if (rewardToUse > 0) {
            results[addr].balance = results[addr].balance + rewardToUse;
          }
        } catch (error) {
          console.error(`Error processing data for address ${addr}:`, error);
        }
      })
      .on("end", () => {
        resolve();
      });
  });

  const outputData = [];
  Object.keys(results).forEach((addr) => {
    outputData.push({
      address: addr,
      balance: results[addr].balance.toString(),
    });
  });

  return outputData;
}

async function processTokenBalancesAndShares(
  Multicall,
  accounts,
  vaultAddress,
  balance,
  i
) {
  const balanceCalls = accounts.map((account) => ({
    target: vaultAddress,
    callData: new ethers.utils.Interface(MOO_ABI).encodeFunctionData(
      "balanceOf",
      [account]
    ),
  }));

  const totalSupplyCall = [
    {
      target: vaultAddress,
      callData: new ethers.utils.Interface(MOO_ABI).encodeFunctionData(
        "totalSupply",
        []
      ),
    },
  ];

  const allCalls = [...balanceCalls, ...totalSupplyCall];

  // console.log("🚀 ~ processTokenBalancesAndShares ~ allCalls:", allCalls);

  const returnData = await batchMulticall(Multicall, allCalls);

  await processAndFormatResults(
    vaultAddress,
    accounts,
    returnData,
    balanceCalls.length,
    balance,
    i
  );
}

async function processAndFormatResults(
  vaultAddress,
  accounts,
  returnData,
  balanceCallsLength,
  balance,
  i
) {
  const results = [];
  const totalSupplyData = returnData.slice(balanceCallsLength);

  let index = 0;
  const accountStakes = [];

  for (const account of accounts) {
    const stakedBalance = ethers.utils.defaultAbiCoder
      .decode(["uint256"], returnData[index])[0]
      .toString();
    if (parseInt(stakedBalance) > 0) {
      accountStakes.push({
        holderAddress: account,
        stakedBalance,
      });
    }
    index++;
  }

  const totalSupply = ethers.utils.defaultAbiCoder
    .decode(["uint256"], totalSupplyData.shift())[0]
    .toString();

  if (accountStakes.length > 0) {
    const shares = accountStakes
      .map((stake) => ({
        holderAddress: stake.holderAddress,
        stakedBalance: stake.stakedBalance,
        shareOfTargetToken: JSBI.divide(
          JSBI.multiply(JSBI.BigInt(stake.stakedBalance), JSBI.BigInt(balance)),
          JSBI.BigInt(totalSupply)
        ).toString(),
      }))
      .sort((a, b) => b.shareOfTargetToken - a.shareOfTargetToken);

    // Calculate rewards based on shares
    shares.forEach((share) => {
      const address = share.holderAddress;
      if (!rewards[address]) {
        rewards[address] = { reward: 0 }; // Ensure initialization
      }
      const currentReward = rewards[address].reward;

      // Multiply rewardsAmount by a scaling factor to maintain precision
      const scaledRewardAmount = rewardsAmount[i] * 1e18;
      // Perform scaled multiplication and division
      const additionalReward = JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(share.stakedBalance),
          JSBI.BigInt(scaledRewardAmount)
        ),
        JSBI.BigInt(totalSupply)
      );

      // Scale back down by dividing the result by 1e18
      const finalRewardToAdd = parseInt(additionalReward) / 1e18;

      // console.log(
      //   `Calculated additionalReward for ${address}: ${finalRewardToAdd.toString()} ${additionalReward.toString()}`
      // );

      if (JSBI.greaterThan(finalRewardToAdd, JSBI.BigInt(0))) {
        rewards[address].reward = currentReward + finalRewardToAdd;
        // console.log(
        //   `Updated reward for ${address}: ${rewards[address].reward}`
        // );
      } else {
        // console.log(
        //   `Additional reward for ${address} was too small, resulting in 0 after scaling.`
        // );
      }
    });
    results.push({
      vault: vaultAddress,
      stakes: shares,
    });
  }

  const old_csv = await processCSV(inputFiles[i]);

  const mergedData = mergeData(
    stakeOutputFiles[i].toString(),
    old_csv,
    results,
    decimals[i],
    i == 1
  );

  console.log("Saving results...");
  fs.writeFileSync(outputFiles[i].toString(), mergedData);
  console.log(`Results written to ${outputFiles[i]?.toString()}`);
}

function mergeData(file, oldCsv, stakes, divisor, checkRewards) {
  console.log("Saving stakes...");
  fs.writeFileSync(file, JSON.stringify(stakes));
  console.log("Stakes saved to file:", file);

  console.log("Updating CSV with new balances and rewards...");
  console.log("🚀 ~ mergeData ~ checkRewards:", checkRewards);

  // Using floating-point numbers for calculations
  const csvMap = new Map(
    oldCsv.map((item) => {
      const parsedBalance = parseFloat(item.balance);
      // console.log(`Loaded balance for ${item.address}: ${parsedBalance}`);
      return [item.address, parsedBalance]; // Keep as float
    })
  );

  stakes.forEach((stake) => {
    console.log(`Processing stake for vault: ${stake.vault}`);
    stake.stakes.forEach((holder) => {
      const address = ethers.utils.getAddress(holder.holderAddress);
      const newBalance = holder.shareOfTargetToken / divisor;

      // console.log(
      //   `New balance for ${address} (after divisor ${divisor}): ${newBalance}`
      // );

      let rewardToAdd = 0;
      if (checkRewards && rewards[address]) {
        rewardToAdd = parseFloat(rewards[address].reward);
        // console.log(`Reward to add for ${address}: ${rewardToAdd}`);
      }

      const totalBalance = newBalance + rewardToAdd;
      // console.log(
      //   `Total balance for ${address} (new balance + reward): ${totalBalance}`
      // );

      if (csvMap.has(address)) {
        const currentBalance = csvMap.get(address);
        const updatedBalance = currentBalance + totalBalance;
        // console.log(
        //   `Updated balance for ${address}: ${currentBalance} + ${totalBalance} = ${updatedBalance}`
        // );
        csvMap.set(address, updatedBalance.toFixed(9)); // To ensure consistent decimal places
      } else {
        // console.log(
        //   `Creating new balance entry for ${address}: ${totalBalance}`
        // );
        csvMap.set(address, totalBalance.toFixed(9));
      }
    });
  });

  let outputData = "";
  console.log("Generating output data...");

  Array.from(csvMap.entries())
    .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
    .forEach(([address, balance]) => {
      // console.log(`Addresss: ${address}, Final Balance: ${balance}`);
      outputData += `${address},${balance}\n`;
    });

  console.log("Output data generation complete.");
  return outputData;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
