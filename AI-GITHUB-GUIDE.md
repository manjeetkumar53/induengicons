# 🤖 AI Assistant Quick Reference for induengicons

**🔐 AUTHENTICATION SETUP (ALWAYS RUN FIRST):**
```bash
gh auth switch --user manjeetsingh53
git config user.name "Manjeet Kumar"
git config user.email "manjeetkumar53@gmail.com"
```

**📦 REPOSITORY INFO:**
- Repository: `manjeetkumar53/induengicons` 
- GitHub CLI Account: `manjeetsingh53`
- Git User: `Manjeet Kumar <manjeetkumar53@gmail.com>`
- Status: ✅ Working (Last updated: Sept 25, 2025)

**🚀 QUICK COMMANDS:**

**Automated (Recommended):**
```bash
# Setup + Push
./github-setup.sh push origin main

# Setup + Pull  
./github-setup.sh pull origin main

# Just setup authentication
./github-setup.sh

# Using npm scripts
npm run git:push
npm run git:pull
npm run git:setup
```

**Manual:**
```bash
# 1. Setup first
gh auth switch --user manjeetsingh53
git config user.name "Manjeet Kumar"  
git config user.email "manjeetkumar53@gmail.com"

# 2. Then git operations
git push origin main
git pull origin main
```

**🔧 TROUBLESHOOTING:**
- **403 Error**: Run `gh auth status` then `gh auth switch --user manjeetsingh53`
- **Account not found**: Run `gh auth login` and authenticate as manjeetsingh53
- **Permission denied**: Verify with `gh auth status` that manjeetsingh53 is active

**📋 AI ASSISTANT WORKFLOW:**
1. When user asks for git operations (commit/push/pull/PR)
2. Always run authentication setup first  
3. Use automated scripts: `./github-setup.sh [operation]`
4. Verify success with git status

**🎯 LAST SUCCESSFUL OPERATIONS:**
- ✅ Comprehensive data grid system (commit: 601ed55)  
- ✅ GitHub config automation (commit: 3e9512d)
- ✅ Authentication working correctly