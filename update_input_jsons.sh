#!/bin/bash

REPOS_DIR="repos"
INPUT_JSONS_DIR="input_jsons"
CONSOLIDATED_OUTPUT_DIR="consolidated_output"

# Ensure necessary directories exist
mkdir -p $INPUT_JSONS_DIR
mkdir -p $CONSOLIDATED_OUTPUT_DIR

# Fetch outputs from metis-migration 
cd $REPOS_DIR/metis-migration

# Ensure that there are jsons to copy, otherwise, it could also cause errors if the glob doesn't match any files
echo "Copying files from metis-migration to $INPUT_JSONS_DIR"
cp totals.json ../../$INPUT_JSONS_DIR/
cp pending_rewards.json ../../$INPUT_JSONS_DIR/
cp staked_balance_*.json ../../$INPUT_JSONS_DIR/
cd ../..

# Run ve-hermes-migration scripts
echo "Copying files from ve-hermes-migration to $INPUT_JSONS_DIR"
cd $REPOS_DIR/ve-hermes-migration
cp locked_balances.json ../../$INPUT_JSONS_DIR/
cp pending_bribes_*.json ../../$INPUT_JSONS_DIR/
cd ../..

echo "All input data has been loaded from repos."
