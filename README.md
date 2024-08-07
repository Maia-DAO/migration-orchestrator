### README.md

````markdown
# Project Title: Migration Orchestrator

## Features

- **CSV Parsing:** Processes multiple CSV files to extract balance information.
- **Data Consolidation:** Aggregates balance data from various sources.
- **Sort by Balance:** Orders all entries by balance amount in descending order.
- **Output in JSON:** Generates a JSON file with sorted balance data.

## Prerequisites

Before you can run this project, you need to ensure you have the following installed:

- Node.js (preferably version 14 or higher)
- npm or Yarn (for managing Node.js packages)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Maia-DAO/migration-orchestrator.git
   cd migration-orchestrator
   ```
````

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or if you use Yarn:
   ```bash
   yarn install
   ```

## Project Structure

- `input_csv/`: Directory containing all CSV files to be processed.
- `output/`: Directory where the `starHermes.json` will be stored after processing.

## Usage

To run the script and process the balances, use the following command from the root directory of the project:

```bash
./orchestrator.sh
```

This command will read all CSV files specified in the script, consolidate and sort the balance data, and output the sorted result into the `output/starHermes.json` file.

## Configuration

No additional configuration is needed to run the project as provided. However, you can modify the CSV file paths and output file name in `consolidate_data.js` if needed.