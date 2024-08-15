const { ethers } = require("ethers");
const fs = require("fs");
const JSBI = require("jsbi");

// Configuration and Constants
const PROVIDER_URL =
  "https://metis-mainnet.g.alchemy.com/v2/FWmhvca-2KGl6D1o9YcToyEeO8Lmshcy";
const MIGRATION_BLOCK = 18097914;
const MULTICALL_ADDRESS = "0x5D78bF8f79A66e43f5932c1Ae0b8fA6563F97f74";
const BATCH_SIZE = 100;
const TOKEN_LIST = [
  {
    address: "0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD",
    creationBlock: 181136,
    outputFile: "./consolidated_output/maia_new.csv",
  },
  {
    address: "0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8",
    creationBlock: 1324876,
    outputFile: "./consolidated_output/hermes_new.csv",
  },
  {
    address: "0xaFF73f55968Ab4b276a26E574c96e09A615b13d6",
    creationBlock: 1283785,
    outputFile: "./consolidated_output/starHermes_new.csv",
  },
  {
    address: "0xD7a586CE5250bEfaB2cc2239F7226B9602536E6A",
    creationBlock: 3522043,
    outputFile: "./consolidated_output/sMaia_new.csv",
  },
  {
    address: "0x559119275a8A862EdbD2cDE21196f4c758D5Ab84",
    creationBlock: 200712,
    outputFile: "./consolidated_output/old_sMaia_new.csv",
  },
];

const MOO_ABI = [
  {
    inputs: [],
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
        indexed: true,
        internalType: "address",
        name: "newVault",
        type: "address",
      },
    ],
    name: "VaultTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
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
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
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
        name: "owner",
        type: "address",
      },
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
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
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
    inputs: [
      {
        internalType: "address",
        name: "vault_",
        type: "address",
      },
    ],
    name: "setVault",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "newOwner_",
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
    name: "vault",
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

const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

// Main function to process all tokens
async function main() {
  try {
    for (const token of TOKEN_LIST) {
      await processToken(token);
    }
  } catch (error) {
    console.error("Error in main function:", error);
    process.exitCode = 1;
  }
}

// Process each token
async function processToken({ address, creationBlock, outputFile }) {
  try {
    const block = await provider.getBlockNumber();
    console.log(
      `Processing token: ${address} from block ${creationBlock} to ${block}`
    );

    const Token = new ethers.Contract(address, MOO_ABI, provider);
    const accounts = await getHolders(Token, creationBlock, block);
    console.log(`Found ${accounts.length} accounts`);

    const Multicall = new ethers.Contract(
      MULTICALL_ADDRESS,
      MULTICALL_ABI,
      provider
    );

    // Write CSV header if file does not exist
    if (!fs.existsSync(outputFile)) {
      fs.writeFileSync(outputFile, "holderAddress,balance\n");
    }

    // Process accounts in smaller batches
    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batchAccounts = accounts.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${i / BATCH_SIZE + 1} with ${
          batchAccounts.length
        } accounts`
      );
      await processTokenBalancesAndShares(
        Multicall,
        batchAccounts,
        address,
        outputFile
      );
    }
  } catch (error) {
    console.error(`Error processing token ${address}:`, error);
  }
}

// Batch multicall to fetch data in chunks
async function batchMulticall(Multicall, calls) {
  let results = [];
  for (let i = 0; i < calls.length; i += BATCH_SIZE) {
    const batchCalls = calls.slice(i, i + BATCH_SIZE);
    try {
      const { returnData } = await Multicall.aggregate(batchCalls, {
        blockTag: MIGRATION_BLOCK,
      });
      results = results.concat(returnData);
    } catch (error) {
      console.error("Error in batchMulticall:", error);
      break;
    }
  }
  return results;
}

// Fetch holders by scanning logs
async function getHolders(token, fromBlock, toBlock) {
  const logs = await fetchLogsInBatches(token, fromBlock, toBlock, 500000);
  const uniqueAddresses = new Set();
  const ADDRESSES_TO_IGNORE = ["0x0000000000000000000000000000000000000000"];

  for (const log of logs) {
    const from = ethers.utils.getAddress("0x" + log.topics[1].slice(26));
    const to = ethers.utils.getAddress("0x" + log.topics[2].slice(26));
    if (!ADDRESSES_TO_IGNORE.includes(from)) uniqueAddresses.add(from);
    if (!ADDRESSES_TO_IGNORE.includes(to)) uniqueAddresses.add(to);
  }

  return Array.from(uniqueAddresses);
}

// Fetch logs in batches for performance optimization
async function fetchLogsInBatches(vault, startBlock, endBlock, batchSize) {
  let allLogs = [];
  for (
    let currentBlock = startBlock;
    currentBlock <= endBlock;
    currentBlock += batchSize
  ) {
    const batchEndBlock = Math.min(currentBlock + batchSize - 1, endBlock);
    try {
      const transferEventSignature = vault.interface.getEventTopic("Transfer");
      const logs = await vault.queryFilter(
        { topics: [transferEventSignature] },
        currentBlock,
        batchEndBlock
      );
      allLogs = allLogs.concat(logs);
    } catch (error) {
      console.error(
        `Error fetching logs from ${currentBlock} to ${batchEndBlock}:`,
        error
      );
      break;
    }
  }
  return allLogs;
}

// Process balances and shares for token holders
async function processTokenBalancesAndShares(
  Multicall,
  accounts,
  vaultAddress,
  outputFile
) {
  try {
    const balanceCalls = accounts.map((account) => ({
      target: vaultAddress,
      callData: new ethers.utils.Interface(MOO_ABI).encodeFunctionData(
        "balanceOf",
        [account]
      ),
    }));

    const returnData = await batchMulticall(Multicall, balanceCalls);
    await processAndFormatResults(accounts, returnData, outputFile);
  } catch (error) {
    console.error(`Error processing balances for ${vaultAddress}:`, error);
  }
}

async function processAndFormatResults(accounts, returnData, outputFile) {
  // Parse the balances
  const accountBalances = accounts.map((account, index) => {
    const tokenBalance = ethers.utils.defaultAbiCoder
      .decode(["uint256"], returnData[index])[0]
      .toString();
    return { account, balance: JSBI.BigInt(tokenBalance) };
  });

  // Sort by balance in descending order
  accountBalances.sort((a, b) =>
    JSBI.lessThan(JSBI.BigInt(b.balance), JSBI.BigInt(a.balance)) ? -1 : 1
  );

  // Format the sorted balances as CSV lines
  const csvLines = accountBalances
    .map(({ account, balance }) => `${account},${balance}`)
    .join("\n");

  // Append the results to the output file
  fs.appendFileSync(outputFile, `${csvLines}\n`);
  console.log(`Results appended to ${outputFile}`);
}

main();
