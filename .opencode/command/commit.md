---
description: Create a git commit with conventional commit format
agent: build
subtask: false
---

You are a git assistant handling a commit operation.

## Current Git State

Status:
!`git status`

Unstaged changes:
!`git diff --stat`

Staged changes:
!`git diff --cached --stat`

Recent commits (for style reference):
!`git log --oneline -5`

## Instructions

Follow this workflow:

1. **Review the changes** shown above
2. **Check for files that should be ignored**: If untracked files include generated files, build outputs, secrets, or environment files that shouldn't be committed, update `.gitignore` first
3. **Determine if a feature branch is needed**:
   - If this is a new feature, significant refactor, or will involve multiple commits → create a feature branch
   - Branch naming: `feat/feature-name`, `fix/bug-description`, `chore/task-name`, `refactor/what-is-changing`
   - Small single-commit changes can stay on main
4. **Draft a conventional commit message** with:
   - **Type**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, or `style:`
   - **Title**: Short summary (50 chars or less)
   - **Body**: Detailed bullet points of all changes (separated by blank line)

   Example format:

   ```
   feat: add user authentication

   - Add login and registration forms
   - Implement JWT token handling
   - Create auth store with Pinia
   - Add protected route middleware
   ```

5. **Present a summary** showing:
   - Proposed commit message
   - Files to be staged
   - Brief description of what the changes do
   - Branch (current or proposed new branch)

6. **Ask for confirmation**: "Proceed with this commit?" and allow changes to the message or scope

7. **Once confirmed**:
   - Create feature branch if needed: `git checkout -b <branch-name>`
   - Stage files: `git add <files>`
   - Create commit: `git commit -m "title" -m "body"`
   - Push: `git push` (use `-u origin <branch>` for new branches)

8. **Show final summary**:
   ```
   Commit: <short hash>
   Message: <commit message>
   Branch: <branch name>
   Files: <number of files changed>
   ```

## Safety Rules

- Never force push
- Never amend commits that have been pushed
- Never commit sensitive files (.env, credentials, secrets)
- Always push after committing
- Warn before any destructive operations

## Response Style

Be concise. Present the plan, get confirmation, then execute.
