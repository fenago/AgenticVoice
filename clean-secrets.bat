@echo off
echo Cleaning secrets from Git history
echo =================================
echo.

echo Step 1: Check current git log...
git log --oneline -5

echo.
echo Step 2: Creating a new orphan branch without history...
git checkout --orphan clean-main

echo.
echo Step 3: Adding all files to the new branch...
git add -A

echo.
echo Step 4: Committing all files with clean history...
git commit -m "Initial commit: AgenticVoice project - all features implemented"

echo.
echo Step 5: Deleting the old main branch...
git branch -D main

echo.
echo Step 6: Renaming clean-main to main...
git branch -m main

echo.
echo Step 7: Force pushing to GitHub with clean history...
git push -f origin main

echo.
echo Done! The repository now has clean history without any secrets.
pause
