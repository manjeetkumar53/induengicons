#!/bin/bash

# GitHub Auto-Switch Script for induengicons repository
# This script automatically switches to the correct GitHub account for git operations

# Repository configuration
REPO_OWNER="manjeetkumar53"
REPO_NAME="induengicons"
GITHUB_CLI_ACCOUNT="manjeetsingh53"
GIT_USER_NAME="Manjeet Kumar"
GIT_USER_EMAIL="manjeetkumar53@gmail.com"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Setting up GitHub configuration for ${REPO_OWNER}/${REPO_NAME}${NC}"

# Function to check if we're in the correct repository
check_repository() {
    local current_remote=$(git remote get-url origin 2>/dev/null)
    local expected_remote="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
    
    if [[ "$current_remote" != "$expected_remote" ]]; then
        echo -e "${RED}❌ Error: This script is for ${REPO_OWNER}/${REPO_NAME} repository${NC}"
        echo -e "${RED}   Current remote: $current_remote${NC}"
        echo -e "${RED}   Expected remote: $expected_remote${NC}"
        exit 1
    fi
}

# Function to setup git user configuration
setup_git_user() {
    echo -e "${YELLOW}⚙️  Setting up git user configuration...${NC}"
    git config user.name "$GIT_USER_NAME"
    git config user.email "$GIT_USER_EMAIL"
    echo -e "${GREEN}✅ Git user configured as: $GIT_USER_NAME <$GIT_USER_EMAIL>${NC}"
}

# Function to switch GitHub CLI account
switch_github_account() {
    echo -e "${YELLOW}🔄 Switching to GitHub CLI account: $GITHUB_CLI_ACCOUNT...${NC}"
    
    # Check if gh is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
        echo -e "${YELLOW}💡 Install with: brew install gh${NC}"
        exit 1
    fi
    
    # Switch to correct account
    if gh auth switch --user "$GITHUB_CLI_ACCOUNT" 2>/dev/null; then
        echo -e "${GREEN}✅ Switched to GitHub account: $GITHUB_CLI_ACCOUNT${NC}"
    else
        echo -e "${YELLOW}⚠️  Account $GITHUB_CLI_ACCOUNT not found, attempting login...${NC}"
        gh auth login
    fi
    
    # Verify authentication
    echo -e "${YELLOW}🔍 Verifying authentication...${NC}"
    gh auth status
}

# Function to perform git operation
perform_git_operation() {
    local operation=$1
    shift # Remove first argument, rest are passed to git command
    
    echo -e "${YELLOW}🚀 Performing git operation: $operation${NC}"
    
    case $operation in
        "push")
            git push "$@"
            ;;
        "pull")
            git pull "$@"
            ;;
        "fetch")
            git fetch "$@"
            ;;
        *)
            echo -e "${RED}❌ Unsupported operation: $operation${NC}"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Git $operation completed successfully${NC}"
    else
        echo -e "${RED}❌ Git $operation failed${NC}"
        exit 1
    fi
}

# Main execution
main() {
    check_repository
    setup_git_user
    switch_github_account
    
    # If arguments are provided, perform the git operation
    if [ $# -gt 0 ]; then
        perform_git_operation "$@"
    else
        echo -e "${GREEN}✅ GitHub configuration setup completed${NC}"
        echo -e "${YELLOW}💡 Usage: ./github-setup.sh push origin main${NC}"
        echo -e "${YELLOW}💡 Usage: ./github-setup.sh pull origin main${NC}"
    fi
}

# Run main function with all arguments
main "$@"