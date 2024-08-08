// consolidate_airdrop_data.js
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const JSBI = require('jsbi');

const INPUT_CSV_DIR = 'input_csv';
const OUTPUT_DIR = 'consolidated_output';
const results = {};

fs.mkdirSync(OUTPUT_DIR, { recursive: true }); // Ensure output directory exists

// Helper function to read CSV and process data
function processCSV(filename) {
    return new Promise((resolve) => {
        fs.createReadStream(path.join(INPUT_CSV_DIR, filename))
            .pipe(csv({
                headers: false, // Set to false if no headers are present
                separator: ',', // Adjust if using a different delimiter
                skipLines: 0, // Adjust based on file format, use if the first line is malformed or not data
                trim: true, // Automatically trim values to remove whitespace
            }))
            .on('data', (row) => {
                const addr = row['0'];
                const reward = row['2'];
                if (!results[addr]) {
                    results[addr] = { balance: JSBI.BigInt(0) };  // Initialize with a BigInt.
                }
                try {
                    const rewardBigInt = JSBI.BigInt(reward || '0');

                    if (JSBI.greaterThan(rewardBigInt, JSBI.BigInt(0))) {

                        // Check if the address is undefined or not a valid string
                        if (typeof addr !== 'string' || !addr) {
                            throw new Error("Address is undefined or not valid.");
                        }

                        results[addr][filename] = rewardBigInt.toString();
                        results[addr].balance = JSBI.add(results[addr].balance, rewardBigInt);
                    }
                } catch (error) {
                    console.error(`Error processing data for address ${addr}:`, error);
                }
            })
            .on('end', () => {
                resolve();
            });
    });
}

// Function to consolidate data
async function consolidateData() {
    await Promise.all([
        processCSV('balances_lp1.csv'),
        processCSV('balances_lp2.csv'),
        processCSV('balances_s1.csv'),
        processCSV('balances_s2.csv'),
    ]);

    const outputData = {};
    Object.keys(results).forEach(addr => {
        outputData[addr] = { ...results[addr], balance: results[addr].balance.toString() };
    });

    // Write the results to a JSON file
    fs.writeFileSync(path.join(OUTPUT_DIR, 'bHermes.json'), JSON.stringify(outputData, null, 2));
    console.log('Data has been consolidated.');
}

consolidateData();
