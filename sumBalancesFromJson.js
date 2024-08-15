const fs = require("fs");

// Function to sum balances from a JSON file, excluding addresses from a blocklist
function sumBalancesFromJson(filePath, excludeFilePath) {
  // Read the JSON file
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  // Read the exclude list file
  const rawExcludeData = fs.readFileSync(excludeFilePath);
  const excludeList = JSON.parse(rawExcludeData);

  // Convert the exclude list to a Set for faster lookup
  const excludeSet = new Set(excludeList);

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

  // Return the total balance
  return totalBalance;
}

const files = ["bHermes", "hermes", "maia"];
const excludeFilePath = "input_jsons/addresses_to_exclude.json"; // Replace with the path to your exclude list file

files.forEach((file) => {
  // Example usage
  const filePath = "consolidated_output/" + file + "_rejects.json"; // Replace with the path to your JSON file
  const totalBalance = sumBalancesFromJson(filePath, excludeFilePath);
  console.log(
    `Total rejects ${file} Balance (excluding specific addresses): ${totalBalance}`
  );
});
