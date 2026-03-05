param(
  [Parameter(Mandatory=$true)][string]$RepoName,
  [Parameter(Mandatory=$false)][string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing command: $name. Install it then rerun."
  }
}

Require-Cmd git
Require-Cmd gh

# Ensure we're in a project folder
if (-not (Test-Path ".\package.json")) {
  throw "package.json not found. Run this from the project root."
}

# Init git if needed
if (-not (Test-Path ".\.git")) {
  git init | Out-Null
}

# Create .gitignore if missing
if (-not (Test-Path ".\.gitignore")) {
@"
node_modules
dist
.vercel
.env
.env.local
.env.*.local
.DS_Store
"@ | Set-Content -Encoding UTF8 .gitignore
}

# First commit
git add -A
try { git commit -m "Initial commit" | Out-Null } catch { }

# Create GitHub repo (private by default - change to --public if you want)
# No options requested -> keep private
gh repo create $RepoName --private --source . --remote origin --push

# Ensure branch name
git branch -M $Branch
git push -u origin $Branch

Write-Host "DONE: GitHub repo created and pushed: $RepoName"