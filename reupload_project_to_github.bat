@echo off
echo Initializing Git repository...
git init

git remote add origin https://github.com/Warda502/ascent-dashboard-ui.git

echo Adding all files...
git config --global user.name "Warda502"
git config --global user.email "wrdhkhald2004@gmail.com"

git add .

echo Creating initial commit...
git commit -m "Reupload project after recovery"

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

pause
