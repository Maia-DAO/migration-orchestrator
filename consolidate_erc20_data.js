// consolidate_airdrop_data.js
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const JSBI = require("jsbi");
const { ethers } = require("ethers");

const INPUT_CSV_DIR = "input_csv";
const OUTPUT_DIR = "consolidated_output";
const input_maia = "maia.csv";
const input_sMaia = "sMaia.csv";
const input_old_sMaia = "old_sMaia.csv";
const input_hermes = "hermes.csv";
const input_starHermes = "starHermes.csv";

// Helper function to read CSV and process data
async function processCSV(filename, output) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true }); // Ensure output directory exists

  // Try to load existing data from hermes.json if it exists
  let results = {};
  const outputFilePath = path.join(OUTPUT_DIR, output);
  if (fs.existsSync(outputFilePath)) {
    results = JSON.parse(fs.readFileSync(outputFilePath));
  }

  await new Promise((resolve) => {
    fs.createReadStream(path.join(INPUT_CSV_DIR, filename))
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
          results[addr] = { balance: "0" }; // Initialize with a BigInt.
        }
        try {
          const rewardBigInt = JSBI.BigInt(reward);

          // Check if the address is undefined or not a valid string
          if (typeof addr !== "string" || !addr) {
            throw new Error("Address is undefined or not valid.");
          }

          if (JSBI.greaterThan(rewardBigInt, JSBI.BigInt(0))) {
            results[addr][filename] = rewardBigInt.toString();
            results[addr].balance = JSBI.add(
              JSBI.BigInt(results[addr].balance),
              rewardBigInt
            ).toString();
          }
        } catch (error) {
          console.error(`Error processing data for address ${addr}:`, error);
        }
      })
      .on("end", () => {
        resolve();
      });
  });

  const outputData = {};
  Object.keys(results).forEach((addr) => {
    outputData[addr] = {
      ...results[addr],
      balance: results[addr].balance.toString(),
    };
  });

  // Write the results to a JSON file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, output),
    JSON.stringify(outputData, null, 2)
  );
  console.log("Data has been consolidated from ", output);
}

// Function to consolidate data
async function consolidateData() {
  await processCSV(input_maia, "maia.json");
  await processCSV(input_sMaia, "maia.json");
  await processCSV(input_old_sMaia, "maia.json");
  await processCSV(input_hermes, "hermes.json");
  await processCSV(input_starHermes, "bHermes.json");
}

consolidateData();
