const fs = require('fs');
const path = require('path');

// Function to read JSON data from a file
function readJSON(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

// Function to check for duplicate addresses in JSON data
function checkForDuplicateAddresses(data) {
    const seenAddresses = new Set();
    const duplicates = [];

    Object.keys(data).forEach(key => {
        const address = key;
        if (seenAddresses.has(address)) {
            duplicates.push(address);
        } else {
            seenAddresses.add(address);
        }
    });

    return duplicates;
}

// Main function to run the checks
function main() {
    const args = process.argv.slice(2); // Get command-line arguments
    if (args.length < 1) {
        console.log('Please provide a filename as an argument.');
        return;
    }

    const fileName = args[0];
    const filePath = path.join(__dirname, fileName); // Construct file path

    const data = readJSON(filePath);
    if (data) {
        const duplicates = checkForDuplicateAddresses(data);
        if (duplicates.length > 0) {
            console.log('Duplicate addresses found:', duplicates);
        } else {
            console.log('No duplicate addresses found.');
        }
    }
}

main();
