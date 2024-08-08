const fs = require('fs');
const path = require('path');

// Function to load JSON from a file
function loadJSON(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
}

// Function to format and output the data
function formatData(data, divisor, outputFilePath) {
    let outputData = '';
    Object.keys(data).forEach(key => {
        const address = key;
        const balance = parseInt(data[key].balance);
        const formattedBalance = balance / divisor;
        outputData += `${address},${formattedBalance}\n`
        // console.log(`${address},${formattedBalance}`);
    });

    // Write the formatted data to the specified output file
    fs.writeFileSync(outputFilePath, outputData, 'utf8');
    console.log(`Data has been formatted and written to ${outputFilePath}`);
}

// Main function to run the process
function main() {
    const maiaFilePath = path.join(__dirname, 'consolidated_output/maia.json');
    const hermesFilePath = path.join(__dirname, 'consolidated_output/hermes.json');
    const bHermesFilePath = path.join(__dirname, 'consolidated_output/bHermes.json');

    try {
        console.log("Preparing maia...")
        const maia = loadJSON(maiaFilePath);
        formatData(maia, 1e9, 'consolidated_output/maia_calls.json');
        console.log("Done maia.")

        console.log("Preparing hermes...")
        const hermes = loadJSON(hermesFilePath);
        formatData(hermes, 1e18, 'consolidated_output/hermes_calls.json');
        console.log("Done hermes.")

        console.log("Preparing starHermes...")
        const bHermes = loadJSON(bHermesFilePath);
        formatData(bHermes, 1e18, 'consolidated_output/bHermes_calls.json');
        console.log("Done bHermes.")

    } catch (error) {
        console.error('Error processing the JSON file:', error);
    }
}

main();
