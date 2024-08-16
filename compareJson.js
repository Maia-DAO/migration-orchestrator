const fs = require("fs");

// Function to process a JSON file
function processJsonFile(filePath) {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);
  let totalDiff = 0n;

  // Loop through each entry in the JSON data
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      const entry = data[key];
      let sum = 0n;

      // Add all fields except "balance" and "address"
      for (let field in entry) {
        if (
          entry.hasOwnProperty(field) &&
          field !== "balance" &&
          field !== "address"
        ) {
          sum += BigInt(entry[field]);
        }
      }

      // Compare the sum with the "balance" field
      const balance = BigInt(entry["balance"]);
      if (sum !== balance) {
        const diff = balance - sum;
        // Add a new field "balance-diff" with the difference
        entry["balance-check"] = sum.toString();
        entry["balance-diff"] = diff.toString();
        totalDiff += diff;
      }
    }
  }

  // Write the updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Processed JSON data written to ${filePath}`);
  console.log(`Total Difference: ${totalDiff.toString()}`);
}

// Example usage
processJsonFile("consolidated_output/hermes.json");
processJsonFile("consolidated_output/hermes_rejects.json");
processJsonFile("consolidated_output/maia.json");
processJsonFile("consolidated_output/maia_rejects.json");
processJsonFile("consolidated_output/bHermes.json");
processJsonFile("consolidated_output/bHermes_rejects.json");
