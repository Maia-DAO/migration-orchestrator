#!/bin/bash

REPOS_DIR="repos"
mkdir -p $REPOS_DIR

# Function to update or clone a repository
function update_or_clone_repo() {
    local repo_url=$1
    local repo_dir=$2

    # Check if the repository directory exists
    if [ -d "$repo_dir" ]; then
        echo "Updating existing repository in $repo_dir"
        # Navigate to the directory and pull the latest changes
        cd "$repo_dir"
        git pull
        # Install or update dependencies
        yarn install
        forge install
    else
        echo "Cloning repository from $repo_url to $repo_dir"
        # Clone the repository
        git clone "$repo_url" "$repo_dir"
        cd "$repo_dir"
        # Install dependencies
        yarn install
        forge install
    fi

    # Navigate back to the initial directory
    cd -  # or cd $OLDPWD
}

# Update or clone metis-migration repository
update_or_clone_repo "https://github.com/Maia-DAO/metis-migration.git" "$REPOS_DIR/metis-migration"

# Update or clone ve-hermes-migration repository
update_or_clone_repo "https://github.com/Maia-DAO/ve-hermes-migration.git" "$REPOS_DIR/ve-hermes-migration"

echo "Repositories updated and dependencies installed."
