const fs = require('fs');
const { ethers } = require('ethers');

// Setup ethers provider
const provider = new ethers.providers.JsonRpcProvider('https://metis-mainnet.g.alchemy.com/v2/FWmhvca-2KGl6D1o9YcToyEeO8Lmshcy');

const ADDRESSES_JSON_PATH = 'input_jsons/addresses_to_exclude.json';

const GET_CODE_ABI = [{ "type": "function", "name": "isContract", "inputs": [{ "name": "addrs", "type": "address[]", "internalType": "address[]" }], "outputs": [{ "name": "", "type": "bool[]", "internalType": "bool[]" }], "stateMutability": "view" }, { "type": "function", "name": "isContract", "inputs": [{ "name": "addr", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }];
const GET_CODE_ADDRESS = '0xe2a2bd7E86Eb9F2DdE339860b052f80781d6e7d0';
const getCode = new ethers.Contract(GET_CODE_ADDRESS, GET_CODE_ABI, provider)
console.log("🚀 ~ getCode:", getCode)


function loadJSON(path) {
    const rawData = fs.readFileSync(path, 'utf8');
    return JSON.parse(rawData);
}

function saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function overwriteJSON(path, data) {
    const tempPath = path + '.tmp';  // Temporary file path to prevent file corruption if fails mid run
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, path);
}

async function isContracts(addresses) {
    console.log("🚀 ~ isContracts ~ getCode:", getCode)
    const results = await getCode.callStatic.isContract(addresses)
    return ethers.utils.defaultAbiCoder.decode(["bool[]"], results)[0];
}

async function filterEntries(inputFile, outputFile) {
    const data = await loadJSON(inputFile);
    const addressList = await loadJSON(ADDRESSES_JSON_PATH);
    const keys = Object.keys(data);

    const remaining = [];
    const rejected = [];

    // Divide addresses into remaining and rejected based on a predefined list
    keys.forEach(key => {
        if (addressList.includes(key)) {
            rejected.push(data[key]);
        } else {
            remaining.push(key);
        }
    });

    // Check which of the remaining addresses are contracts
    const areContracts = await isContracts(remaining);
    const finalRemaining = [];
    const finalRejected = [...rejected]; // Start with already rejected addresses

    // Filter out contracts from remaining
    remaining.forEach((address, index) => {
        if (areContracts[index]) {
            finalRejected.push(data[address]);
        } else {
            finalRemaining.push(data[address]);
        }
    });

    console.log('Remaining:', finalRemaining);
    console.log('Rejected:', finalRejected);

    // overwrite input
    await overwriteJSON(inputFile, finalRemaining);
    // save rejects
    await saveJSON(outputFile, finalRejected);

    console.log('Filtering complete. Check the output files for results.');
}

filterEntries('consolidated_output/maia.json', 'consolidated_output/maia_rejects.json').catch(console.error);
filterEntries('consolidated_output/hermes.json', 'consolidated_output/hermes_rejects.json').catch(console.error);
filterEntries('consolidated_output/bHermes.json', 'consolidated_output/bHermes_rejects.json').catch(console.error);
