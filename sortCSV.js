const fs = require("fs");
const path = require("path");

// Function to sort CSV by numbers in the second column
function sortCSVByNumbers(inputFilePath, outputFilePath) {
  fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Split the file content by lines and then map them to key-value pairs
    const lines = data
      .trim()
      .split("\n")
      .map((line) => {
        const columns = line.split(",");
        return { columns, sortColumn: BigInt(columns[1]) }; // Use BigInt for sorting by the second column
      });

    // Sort the array by the number
    lines.sort((a, b) => (a.sortColumn > b.sortColumn ? -1 : 1));

    // Convert sorted array back to CSV format
    const sortedData = lines.map((line) => line.columns.join(",")).join("\n");

    // Write the sorted data back to a CSV file
    fs.writeFile(outputFilePath, sortedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("File has been sorted and saved to", outputFilePath);
      }
    });
  });
}

// Function to process all CSV files in a directory
function processDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Check if the file has a .csv extension
      if (path.extname(file).toLowerCase() === ".csv") {
        const outputFilePath = path.join(directoryPath, file);
        sortCSVByNumbers(filePath, outputFilePath);
      } else {
        console.log(`Skipping non-CSV file: ${file}`);
      }
    });
  });
}

// Define the directory path
const directoryPath = path.join(__dirname, "input_csv");

// Call the function to process the directory
processDirectory(directoryPath);
