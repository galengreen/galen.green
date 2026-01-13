---
description: Create a git commit with conventional commit format and version bump
agent: build
subtask: false
---

You are a git assistant handling a commit operation with semantic versioning.

## First Step

Run these commands to understand the current state:

1. `git status` - see staged and unstaged files
2. `git diff --stat` - see unstaged changes
3. `git diff --cached --stat` - see staged changes
4. `git log --oneline -5` - see recent commit style
5. `node -p "require('./package.json').version"` - get current version
6. `git tag --sort=-version:refname | head -5` - see recent tags

## Then Follow This Workflow

1. **Review the changes** from the commands above
2. **Check for files that should be ignored**: If untracked files include generated files, build outputs, secrets, or environment files that shouldn't be committed, update `.gitignore` first
3. **Determine if a feature branch is needed**:
   - If this is a new feature, significant refactor, or will involve multiple commits → create a feature branch
   - Branch naming: `feat/feature-name`, `fix/bug-description`, `chore/task-name`, `refactor/what-is-changing`, `docs/what-is-documented`
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

5. **Determine version bump** based on commit type (semantic versioning):
   - `feat:` → **minor** version bump (0.1.0 → 0.2.0) - new features
   - `fix:` → **patch** version bump (0.1.0 → 0.1.1) - bug fixes
   - `chore:`, `docs:`, `refactor:`, `test:`, `style:` → **patch** version bump
   - If commit message contains "BREAKING CHANGE" or an exclamation mark after type → **major** version bump (0.1.0 → 1.0.0)
   - Skip version bump for: work-in-progress commits, or if user requests no version change

6. **Check if documentation needs updating** (see Documentation Updates section below)

7. **Present a summary** showing:
   - Proposed commit message
   - Files to be staged
   - Brief description of what the changes do
   - Branch (current or proposed new branch)
   - **Version change**: current → new (e.g., 0.1.0 → 0.2.0)
   - **Git tag**: v0.2.0
   - **Docs updated**: Yes/No (list which docs if yes)
   - **PR needed**: Yes/No (if on feature branch)

8. **Ask for confirmation**: "Proceed with this commit and version bump?" and allow changes to the message, scope, or version

9. **Once confirmed**:
   - Create feature branch if needed: `git checkout -b <branch-name>`
   - Update version in package.json using `npm version <major|minor|patch> --no-git-tag-version`
   - Stage all files including package.json: `git add <files> package.json`
   - Create commit: `git commit -m "title" -m "body"`
   - Create git tag: `git tag -a v<new-version> -m "<commit title>"`
   - Push commit and tags: `git push && git push --tags` (use `-u origin <branch>` for new branches)
   - If on a feature branch, create a PR (see Pull Request section below)

10. **Show final summary**:
    ```
    Commit: <short hash>
    Message: <commit message>
    Branch: <branch name>
    Files: <number of files changed>
    Version: <old> → <new>
    Tag: v<new-version>
    PR: <url> (if created)
    ```

## Documentation Updates

Before committing, check if these docs need updates based on the changes:

| Doc File               | Update When...                                   |
| ---------------------- | ------------------------------------------------ |
| `README.md`            | Project setup, commands, or structure changes    |
| `docs/HOSTING.md`      | Hosting overview or quick reference changes      |
| `docs/ARCHITECTURE.md` | Infrastructure, containers, or network changes   |
| `docs/DEPLOYMENT.md`   | Deployment procedures or TrueNAS config changes  |
| `docs/ENVIRONMENT.md`  | New/changed environment variables                |
| `AGENTS.md`            | Code style, conventions, or dev workflow changes |

### When to Update Docs

- **feat:** Changes that add new features likely need README or relevant docs updated
- **fix:** Usually no doc changes unless fixing documented behaviour
- **refactor:** Update ARCHITECTURE.md if infrastructure changes
- **chore:** Update docs if build/deploy process changes

### How to Update

1. Read the relevant doc file(s)
2. Update with accurate, concise information matching the change
3. Include the doc updates in the same commit

## Pull Requests

### When to Create a PR

Create a PR when committing to a feature branch (any branch other than `main`).

### PR Creation Process

After pushing the feature branch, create a PR using:

```sh
gh pr create --title "<commit title>" --body "$(cat <<'EOF'
## Summary

<Brief description of what this PR does>

## Changes

<Bullet points from commit message>

## Testing

- [ ] Tested locally
- [ ] Lint passes
- [ ] Type check passes
- [ ] Unit tests pass

## Documentation

<List any docs updated, or "No documentation changes needed">
EOF
)"
```

### PR Title Format

Use the same conventional commit format as the commit:

- `feat: add user authentication`
- `fix: resolve login redirect issue`
- `docs: update deployment guide`

## Safety Rules

- Never force push
- Never amend commits that have been pushed
- Never commit sensitive files (.env, credentials, secrets)
- Always push after committing (including tags)
- Warn before any destructive operations
- Never skip version bump without explicit user approval

## Response Style

Be concise. Present the plan, get confirmation, then execute.
