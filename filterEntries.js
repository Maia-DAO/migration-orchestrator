const fs = require('fs');
const { ethers } = require('ethers');

// Setup ethers provider
const provider = new ethers.providers.JsonRpcProvider('https://metis-mainnet.g.alchemy.com/v2/FWmhvca-2KGl6D1o9YcToyEeO8Lmshcy');

const ADDRESSES_JSON_PATH = 'input_jsons/addresses_to_exclude.json';

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

async function isContract(address) {
    const code = await provider.getCode(address);
    return code !== '0x';  // '0x' indicates no contract at the address
}

async function filterEntries(inputFile, outputFile) {
    const data = await loadJSON(inputFile);
    const addressList = await loadJSON(ADDRESSES_JSON_PATH);
    const remainingEntries = {};
    const rejectedEntries = {};

    for (let key in data) {
        if (!addressList.includes(key) && !(await isContract(key))) {
            remainingEntries[key] = data[key];
        } else {
            rejectedEntries[key] = data[key];
        }
    }

    // overwrite input
    await overwriteJSON(inputFile, remainingEntries);
    // save rejects
    await saveJSON(outputFile, rejectedEntries);

    console.log('Filtering complete. Check the output files for results.');
}

filterEntries('consolidated_output/maia.json', 'consolidated_output/maia_rejects.json').catch(console.error);
filterEntries('consolidated_output/hermes.json', 'consolidated_output/hermes_rejects.json').catch(console.error);
filterEntries('consolidated_output/bHermes.json', 'consolidated_output/bHermes_rejects.json').catch(console.error);
