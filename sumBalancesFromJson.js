const fs = require("fs");
const csvParser = require("csv-parser");

// Function to sum balances from a JSON file, excluding addresses from a blocklist
function sumBalancesFromJson(filePath, excludeSet) {
  // Read the JSON file
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  // Initialize the total balance to 0
  let totalBalance = BigInt(0);

  // Loop through each entry in the JSON data
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      // Only add the balance if the address is not in the exclude list
      if (!excludeSet.has(key)) {
        totalBalance += BigInt(data[key]["balance"]);
      }
    }
  }

  return totalBalance;
}

// Function to sum balances from a CSV file, excluding addresses from a blocklist
function sumBalancesFromCsv(filePath, excludeSet, multiplier) {
  return new Promise((resolve, reject) => {
    let totalBalance = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: false }))
      .on("data", (row) => {
        const address = row[0];
        const balance = parseFloat(row[1]) * multiplier;

        if (!excludeSet.has(address)) {
          totalBalance += balance;
        }
      })
      .on("end", () => {
        resolve(totalBalance);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function main() {
  const files = ["bHermes", "hermes", "maia"];
  const multipliers = [1e18, 1e18, 1e9];
  const excludeFilePath = "input_jsons/addresses_to_exclude.json";

  // Read and parse the exclude list
  const rawExcludeData = fs.readFileSync(excludeFilePath);
  const excludeList = JSON.parse(rawExcludeData);
  const excludeSet = new Set(excludeList);

  let i = 0;
  for (const file of files) {
    const jsonFilePath = `consolidated_output/${file}_rejects.json`;
    const csvFilePath = `consolidated_output/${file}_FINAL.csv`;
    const multiplier = multipliers[i++];

    const jsonBalance = sumBalancesFromJson(jsonFilePath, excludeSet);
    const csvBalance = await sumBalancesFromCsv(
      csvFilePath,
      excludeSet,
      multiplier
    );
    const bigIntMultiplier = BigInt(multiplier);

    console.log(`### Total ${file} Balance:`);
    console.log(`- Rejects JSON: ${jsonBalance / bigIntMultiplier}`);
    console.log(`- Users CSV: ${BigInt(csvBalance) / bigIntMultiplier}`);
    console.log(
      `- Combined: ${
        (jsonBalance + BigInt(Math.round(csvBalance))) / bigIntMultiplier
      }`
    );
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
