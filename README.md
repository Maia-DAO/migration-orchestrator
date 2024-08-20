# Migration Orchestrator

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

## Migration Transactions

The following are the transactions for the migration of balances from the old contract to the new contract:

Maia:
- [0x71830e1a25f80bcc5583615eaa508057cff90b3270ad7f8d4f18a84507f8234d](https://arbiscan.io/tx/0x71830e1a25f80bcc5583615eaa508057cff90b3270ad7f8d4f18a84507f8234d)
- [0xde0bfec1f1b6df9a83d08e25f590e2bf1a29db52c31e3b4dfe76cdbb5b86c2a2](https://arbiscan.io/tx/0xde0bfec1f1b6df9a83d08e25f590e2bf1a29db52c31e3b4dfe76cdbb5b86c2a2)
- [0x47afe069493fde50940c3d45042d5ab6cc9d81c3e5fb00ffbd2b84b2bc98a7a0](https://arbiscan.io/tx/0x47afe069493fde50940c3d45042d5ab6cc9d81c3e5fb00ffbd2b84b2bc98a7a0)
- [0xa00e657c99d13fb6a657fced68c65ab93ec1292e66d239d4d378c5592033c615](https://arbiscan.io/tx/0xa00e657c99d13fb6a657fced68c65ab93ec1292e66d239d4d378c5592033c615)
- For Ara Fi: [0xcbb06aa91012021c0b5ef85767d9d1695110d4e32e674d8460cb9fecfaf884a9](https://arbiscan.io/tx/0xcbb06aa91012021c0b5ef85767d9d1695110d4e32e674d8460cb9fecfaf884a9)

Hermes:
- [0x2b03c78cd76a2fc6b238271461bb0c4f4e3876325df3597b27f1a99d1da963a6](https://arbiscan.io/tx/0x2b03c78cd76a2fc6b238271461bb0c4f4e3876325df3597b27f1a99d1da963a6)
- [0xa4da2b6a429663077d2d5e058caed98ecac900d7381e82f47fe3236f33c9ec7a](https://arbiscan.io/tx/0xa4da2b6a429663077d2d5e058caed98ecac900d7381e82f47fe3236f33c9ec7a)
- [0x0e7d786b4855ee6d244729fb6dc68c7cf5a6d49e07484398a85cca9b9837963a](https://arbiscan.io/tx/0x0e7d786b4855ee6d244729fb6dc68c7cf5a6d49e07484398a85cca9b9837963a)
- [0x22bd9067c2b66be285820f84e94c1a996df9301bf8a16a1773fede5cad5173d6](https://arbiscan.io/tx/0x22bd9067c2b66be285820f84e94c1a996df9301bf8a16a1773fede5cad5173d6)
- [0xcae9b9fe3a4ac20a60ab82385c1bb710bab82b1c3033511ebb6172f97a9c3d45](https://arbiscan.io/tx/0xcae9b9fe3a4ac20a60ab82385c1bb710bab82b1c3033511ebb6172f97a9c3d45)
- [0xfd67d5e3ef47c51983da78ba820f02f0aa144ce1274f25df861796196309a9b7](https://arbiscan.io/tx/0xfd67d5e3ef47c51983da78ba820f02f0aa144ce1274f25df861796196309a9b7)
- [0x110a5adf2c4dd43eea2f1b3838b6c92e6cdbfdc03330f00489f484f25ac24ea2](https://arbiscan.io/tx/0x110a5adf2c4dd43eea2f1b3838b6c92e6cdbfdc03330f00489f484f25ac24ea2)
- For Ara Fi: [0x92a474c48d72e0cadf65790add054413db81db14c02e7a3fe78ce42a5a6b1a3e](https://arbiscan.io/tx/0x92a474c48d72e0cadf65790add054413db81db14c02e7a3fe78ce42a5a6b1a3e)

bHermes:
- [0x244021157ae214355df92856172f9153fed4bd26412298efe65d56ab80e8a806](https://arbiscan.io/tx/0x244021157ae214355df92856172f9153fed4bd26412298efe65d56ab80e8a806)
- [0x8d8f850d5f1258f9e073c92a902b8415949e6e17ca33d9e402dbf24d5c67e10c](https://arbiscan.io/tx/0x8d8f850d5f1258f9e073c92a902b8415949e6e17ca33d9e402dbf24d5c67e10c)
- [0xc8e6ab60be6470553345f8ae09218e0c551550e0c1160dfeed67c92cf90bde48](https://arbiscan.io/tx/0xc8e6ab60be6470553345f8ae09218e0c551550e0c1160dfeed67c92cf90bde48)
- For Ara Fi: [0x54d3c1cab037fa5b1b90f75a4ce8995a63991d5f45a8a2fcd28df6f0d24abe9d](https://arbiscan.io/tx/0x54d3c1cab037fa5b1b90f75a4ce8995a63991d5f45a8a2fcd28df6f0d24abe9d)
