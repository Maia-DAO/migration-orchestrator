#!/bin/bash

REPOS_DIR="repos"
INPUT_JSONS_DIR="input_jsons"
CONSOLIDATED_OUTPUT_DIR="consolidated_output"

# Step 1: Clone repositories and set up dependencies
./clone_and_setup.sh

# Step 2: Run scripts
# ./run_all_scripts.sh

# Step 3: Update inputs
./update_input_jsons.sh

# Step 4: Consolidate airdrop data
echo "Running airdrop data consolidation..."
node consolidate_airdrop_data.js

# Step 5: Consolidate maia data
echo "Running maia data consolidation..."
node consolidate_maia_data.js

# Step 6: Consolidate hermes data
echo "Running hermes data consolidation..."
node consolidate_hermes_data.js

# Step 7: Consolidate bHermes data
echo "Running bHermes data consolidation..."
node consolidate_bHermes_data.js

# Step 7: Consolidate starHermes data
echo "Running starHermes data consolidation..."
node consolidate_starHermes_data.js

# Step 7: Consolidate erc20 data
echo "Running ERC20 data consolidation..."
node consolidate_erc20_data.js

# Step 8: Look for duplicates in maia data
echo "Looking for duplicates in maia..."
node checkDuplicates.js consolidated_output/maia.json

# Step 9: Look for duplicates in hermes data
echo "Looking for duplicates in hermes..."
node checkDuplicates.js consolidated_output/hermes.json

# Step 10: Look for duplicates in bHermes data
echo "Looking for duplicates in bHermes..."
node checkDuplicates.js consolidated_output/bHermes.json

# Step 11: Filter contract addresses
echo "Looking for contract addresses in outputs..."
node filterEntries.js

# Step 12: Get airdrop inputs
echo "Getting airdrop inputs..."
node prepare_calls.js

# Step 13: Get airdrop inputs considering beefy vaults
echo "Getting airdrop inputs considering beefy vaults..."
node prepare_beefy_calls.js

echo "Orchestrator process completed successfully."
