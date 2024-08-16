const fs = require("fs");
const csvParser = require("csv-parser");

// Function to read a CSV and return a map of addresses to balances
function readCsvToMap(filePath) {
  return new Promise((resolve, reject) => {
    const balanceMap = new Map();

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: false }))
      .on("data", (row) => {
        const address = row[0];
        const balance = parseFloat(row[1]);
        balanceMap.set(address, balance);
      })
      .on("end", () => {
        resolve(balanceMap);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Function to compute the difference between two maps of balances and write to a new CSV
async function computeDifference(oldFilePath, newFilePath, outputFilePath) {
  try {
    const oldBalances = await readCsvToMap(oldFilePath);
    const newBalances = await readCsvToMap(newFilePath);
    const differences = [];

    // Compare the balances
    newBalances.forEach((newBalance, address) => {
      const oldBalance = oldBalances.get(address) || 0;
      const difference = newBalance - oldBalance;

      if (difference !== 0) {
        differences.push(`${address},${difference.toPrecision(9)}`);
      }
    });

    differences.sort((a, b) => {
      const amountA = parseFloat(a.split(",")[1]);
      const amountB = parseFloat(b.split(",")[1]);
      return amountB - amountA;
    });

    // Write the differences to a new CSV file
    if (differences.length > 0) {
      const csvData = differences.join("\n");
      fs.writeFileSync(outputFilePath, csvData);
      console.log(`Differences written to ${outputFilePath}`);
    } else {
      console.log(
        `No differences found for ${oldFilePath} and ${newFilePath}.`
      );
    }
  } catch (error) {
    console.error(
      `An error occurred while processing ${oldFilePath} and ${newFilePath}:`,
      error
    );
  }
}

// Array of file pairs to process
const filePairs = [
  {
    oldFilePath: "consolidated_output/hermes_FINAL copy.csv",
    newFilePath: "consolidated_output/hermes_FINAL.csv",
    outputFilePath: "consolidated_output/hermes_FINAL_missing.csv",
  },
  {
    oldFilePath: "consolidated_output/maia_FINAL copy.csv",
    newFilePath: "consolidated_output/maia_FINAL.csv",
    outputFilePath: "consolidated_output/maia_FINAL_missing.csv",
  },
];

async function processFiles() {
  for (const { oldFilePath, newFilePath, outputFilePath } of filePairs) {
    await computeDifference(oldFilePath, newFilePath, outputFilePath);
  }
}

processFiles().catch((error) => {
  console.error("An error occurred during processing:", error);
});
