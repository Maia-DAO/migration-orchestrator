#!/bin/bash

REPOS_DIR="repos"

# Run metis-migration scripts
cd $REPOS_DIR/metis-migration
yarn run all
cd ../..

# Run ve-hermes-migration scripts
cd $REPOS_DIR/ve-hermes-migration
yarn get-balances
yarn get-bribes
cd ../..

echo "All scripts executed."
