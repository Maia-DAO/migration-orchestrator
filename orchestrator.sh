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

echo "Orchestrator process completed successfully."
