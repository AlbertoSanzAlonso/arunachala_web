---name: git-commandsdescription: Essential Git commands for daily development workflowlicense: MITcompatibility: antigravity, opencodemetadata:  audience: developers  domain: git-commands  project: arunachala-web---
## What I do
- Provide essential Git commands for common development tasks
- Handle branch switching and synchronization
- Manage commits and push/pull operations
- Resolve merge conflicts and rebase issues
- Clean up branches and maintain repository health

## When to use me
Use this when you need to:
- Switch between branches safely
- Synchronize with remote repository
- Resolve merge conflicts
- Clean up old branches
- Check repository status
- Reset or revert changes
- Compare branches and commits

## Essential Daily Commands

### Status & Information
```bash
git status                    # Check current state
git log --oneline --graph    # Visual commit history
git branch -a                 # List all branches
git remote -v                  # Show remotes
git diff                      # Show unstaged changes
git diff --staged             # Show staged changes
```

### Branch Operations
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch between branches
git checkout develop
git checkout main

# Push new branch to remote
git push -u origin feature/new-feature

# Pull latest changes
git pull origin develop
git fetch --all

# Delete local branch
git branch -d feature/feature-name

# Delete remote branch  
git push origin --delete feature/feature-name
```

### Commit Workflow
```bash
# Stage all changes
git add .

# Stage specific files
git add src/components/Header.js
git add backend/api/routes.py

# Interactive staging
git add -i

# Commit with conventional format
git commit -m "feat: add user authentication"
git commit -m "fix: resolve calendar sync issue"
git commit -m "docs: update README with new features"

# Commit staged changes with message
git commit -m "type(scope): description"

# Amend last commit
git commit --amend
git commit --amend --no-edit
```

### Synchronization
```bash
# Pull and merge (fast-forward only)
git pull --ff-only origin develop

# Pull and rebase (maintain linear history)
git pull --rebase origin develop

# Push after commit
git push origin feature/branch-name

# Push all branches with upstream
git push --all
```

### Undo & Reset
```bash
# Unstage file
git reset HEAD src/components/Header.js

# Discard unstaged changes
git checkout -- src/components/Header.js

# Reset to last commit (keep changes)
git reset --soft HEAD~1

# Reset to last commit (discard changes)
git reset --hard HEAD~1

# Revert specific commit
git revert abc1234

# Remove file from git tracking
git rm --cached file.txt
```

### Merge & Conflict Resolution
```bash
# Merge branch into current
git merge feature/new-feature

# Abort merge if conflicts
git merge --abort

# Continue merge after resolving conflicts
git merge --continue

# Rebase current branch onto another
git rebase develop

# Interactive rebase (clean up history)
git rebase -i HEAD~3

# Abort rebase
git rebase --abort

# Continue rebase after conflicts
git rebase --continue
```

### History & Comparison
```bash
# Show commit details
git show abc1234

# Show file changes in commit
git show abc1234:src/app.js

# Compare branches
git diff develop..feature/new-feature
git diff main...develop

# Show file history
git log -- src/components/Header.js

# Show who changed what
git blame src/components/Header.js
```

### Cleanup & Maintenance
```bash
# Clean up tracked files
git clean -fd

# Remove stale branches
git remote prune origin

# Garbage collection
git gc --aggressive

# Remove merged branches
git branch --merged | grep -v "main\|develop" | xargs git branch -d
```

## Arunachala Web Specific Commands

### Feature Branch Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# Work on feature...
git add .
git commit -m "feat: description of changes"

# When ready for review
git push origin feature/feature-name
# → Create PR in GitHub web interface

# After merge, clean up
git checkout develop
git pull origin develop
git branch -d feature/feature-name
git push origin --delete feature/feature-name
```

### Hotfix Workflow
```bash
# Start hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Quick fix...
git add .
git commit -m "fix: resolve critical security issue"

# Deploy and merge back
git checkout main
git merge hotfix/critical-bug-fix
git tag v1.0.1
git push origin main --tags

# Also merge to develop
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop
```

### Common Troubleshooting

### "Detached HEAD" State
```bash
git checkout main
# or create new branch from detached state
git checkout -b emergency-fix
```

### Merge Conflicts
```bash
# 1. See conflict markers
git status

# 2. Edit conflicted files manually
# (resolve <<<<<, >>>>, ==== sections)

# 3. Stage resolved files
git add conflicted-file.js

# 4. Continue merge
git commit
```

### Undo Last Commit
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes AND commit
git reset --hard HEAD~1

# Create revert commit (safer for shared branches)
git revert HEAD
```

### Push After Rebase
```bash
# Force push required after rebase
git push --force-with-lease origin feature/branch
```

### Stashing Work
```bash
# Save current work
git stash

# Save with message
git stash push -m "Work in progress on booking"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```

## Branch Protection Workarounds

### Bypass Protection (Emergency Only)
```bash
# Force push to protected branch
git push --force origin main

# Push with lease (safer)
git push --force-with-lease origin main
```

### Update Protected Branch
```bash
# Create PR or use GitHub web interface
# Required for protected main/develop branches
```

## Quick Reference Cards

### Daily Development
```bash
# 1. Start work
git checkout develop && git pull
git checkout -b feature/task-name

# 2. Commit work  
git add . && git commit -m "feat: description"

# 3. Push for review
git push origin feature/task-name
```

### Clean Up
```bash
# After feature merged
git checkout develop
git pull
git branch -d feature/task-name
git push origin --delete feature/task-name
```

### Emergency Reset
```bash
# If everything goes wrong
git checkout main
git reset --hard origin/main
```

## Integration with IDE

### VS Code Integration
- Use GitLens for enhanced blame/history
- Source Control panel for quick operations
- Integrated terminal for Git commands

### GitKraken (if needed)
- Visual merge conflict resolution
- Branch management UI
- Commit history visualization

### GitHub Desktop (for team members)
- Simpler UI for non-technical users
- Visual PR creation and management

## Pro Tips
1. **Commit frequently**: Small, atomic commits are easier to review
2. **Pull before working**: Always sync with develop before starting
3. **Use meaningful messages**: Follow conventional commit format
4. **Clean up regularly**: Remove old branches to avoid confusion
5. **Backup critical work**: Use stashes or feature branches
6. **Test before merging**: Ensure all tests pass before PR