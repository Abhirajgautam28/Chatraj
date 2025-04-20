# Troubleshooting Guide

## PowerShell Execution Policy Error

If you encounter this error when running `npm` commands:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

### Solution:

1. Open PowerShell as Administrator (right-click PowerShell and select "Run as Administrator")

2. Check current execution policy:
```powershell
Get-ExecutionPolicy
```

3. Set the execution policy to allow local scripts:
```powershell
Set-ExecutionPolicy RemoteSigned
```

4. Type 'Y' when prompted to confirm the change

5. Try running the npm command again:
```bash
npm run dev
```

### Alternative Solutions:

1. Use Command Prompt (cmd.exe) instead of PowerShell
2. Use Visual Studio Code's integrated terminal
3. Add this to your PowerShell profile to only allow npm scripts:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Still having issues?

If you're still experiencing problems, try:
1. Closing and reopening your terminal
2. Running `npm cache clean --force`
3. Deleting node_modules folder and running `npm install` again

For more help, check the [official Node.js documentation](https://nodejs.org/en/docs/) or create an issue in the project repository.
