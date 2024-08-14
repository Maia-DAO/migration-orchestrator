const { ethers } = require("ethers");
const fs = require("fs");
const JSBI = require("jsbi");

// Configuration and Constants
const PROVIDER_URL =
  "https://arb-mainnet.g.alchemy.com/v2/FWmhvca-2KGl6D1o9YcToyEeO8Lmshcy";
const BATCH_SIZE = 1000;

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
const MULTICALL_ADDRESS = "0x80C7DD17B01855a6D2347444a0FCC36136a314de";
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

const Multicall = new ethers.Contract(
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  provider
);

// Batch multicall to fetch data in chunks
async function batchMulticall(calls) {
  let results = [];
  for (let i = 0; i < calls.length; i += BATCH_SIZE) {
    const batchCalls = calls.slice(i, i + BATCH_SIZE);
    console.log("Executing batch of size:", batchCalls.length);
    try {
      const { returnData } = await Multicall.aggregate(batchCalls);
      results = results.concat(returnData);
    } catch (error) {
      console.error("Error in batchMulticall:", error);
      break;
    }
  }
  return results;
}

async function batchFetchVirtualAccount(accounts) {
  const ROOT_PORT_ADDRESS = "0x5399Eee5073bC1018233796a291Ffd6a78E26cbb";

  const balanceCalls = accounts.map((account) => ({
    target: ROOT_PORT_ADDRESS,
    callData: "0x59619134000000000000000000000000" + account.slice(2),
  }));

  const results = await batchMulticall(balanceCalls);

  return results.map(
    (data) => ethers.utils.defaultAbiCoder.decode(["address"], data)[0]
  );
}

exports.batchFetchVirtualAccount = batchFetchVirtualAccount;
exports.batchMulticall = batchMulticall;
