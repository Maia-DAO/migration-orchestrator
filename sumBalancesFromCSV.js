const fs = require("fs");
const csvParser = require("csv-parser");

// Function to sum balances from a CSV file, excluding addresses from a blocklist
function sumBalancesFromCsv(filePath, multiplier) {
  return new Promise((resolve, reject) => {
    let totalBalance = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: false }))
      .on("data", (row) => {
        const balance = parseFloat(row[1]) * multiplier;

        totalBalance += balance;
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
  const files = ["hermes", "maia"];
  const multipliers = [1e18, 1e9];

  let i = 0;
  for (const file of files) {
    const csvFilePath = `consolidated_output/${file}_FINAL_missing.csv`;
    const multiplier = multipliers[i++];

    const csvBalance = await sumBalancesFromCsv(csvFilePath, multiplier);
    const bigIntMultiplier = BigInt(multiplier);

    console.log(`### Total ${file} balance missing from first distribution:`);
    console.log(`${BigInt(csvBalance) / bigIntMultiplier}`);
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
