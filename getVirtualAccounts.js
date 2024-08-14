const { getAddress } = require("ethers/lib/utils");
const fs = require("fs");
const path = require("path");

const { batchFetchVirtualAccount } = require("./batchMulticall");

// Function to extract unique Ethereum addresses from CSV files in a directory
function extractUniqueAddresses(directoryPath) {
  const addressSet = new Set();

  // Read all files in the directory synchronously
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    // Check if the file has a .csv extension
    if (path.extname(file).toLowerCase() === ".csv") {
      console.log(`Reading file: ${file}`);

      // Read the file content synchronously
      const data = fs.readFileSync(filePath, "utf8");

      // Split the file content by lines
      const lines = data.trim().split("\n");

      // Extract the Ethereum address (first entry in each line)
      lines.forEach((line) => {
        const [address] = line.split(",");
        addressSet.add(getAddress(address));
      });
    } else {
      console.log(`Skipping non-CSV file: ${file}`);
    }
  });

  // After processing all files, log the number of unique addresses
  console.log("Number of unique Ethereum addresses:", addressSet.size);

  return addressSet;
}

async function main() {
  // Define the directory path
  const directoryPath = path.join(__dirname, "consolidated_output");

  // Call the function to extract unique addresses
  const addressSet = extractUniqueAddresses(directoryPath);
  const addressList = Array.from(addressSet);

  // Get all user virtual accounts
  const virtualAccountList = await batchFetchVirtualAccount(addressList);

  // Create a mapping from address to virtual account
  const addressToVirtualAccount = addressList.reduce((acc, address, index) => {
    acc[address] = virtualAccountList[index];
    return acc;
  }, {});

  fs.writeFileSync(
    path.join(__dirname, "consolidated_output/virtual_accounts.json"),
    JSON.stringify(addressToVirtualAccount, null, 2),
    "utf8"
  );

  const csvToUpdate = [
    {
      name: "consolidated_output/bHermes_calls.csv",
      output: "consolidated_output/bHermes_FINAL.csv",
    },
    {
      name: "consolidated_output/hermes_and_beefy_calls.csv",
      output: "consolidated_output/hermes_FINAL.csv",
    },
    {
      name: "consolidated_output/maia_and_beefy_calls.csv",
      output: "consolidated_output/maia_FINAL.csv",
    },
  ];

  // Process each CSV file, replace the addresses with virtual accounts, and save the updated CSV
  csvToUpdate.forEach(({ name, output }) => {
    const filePath = path.join(__dirname, name);
    const data = fs.readFileSync(filePath, "utf8");

    const lines = data.trim().split("\n");
    const updatedLines = lines.map((line) => {
      const [address, ...rest] = line.split(",");
      const virtualAccount = addressToVirtualAccount[getAddress(address)];
      return [virtualAccount, ...rest].join(",");
    });

    const updatedData = updatedLines.join("\n");
    fs.writeFileSync(path.join(__dirname, output), updatedData, "utf8");
  });
}

main();
