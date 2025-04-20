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

## MongoDB Connection Error

If you encounter this error when connecting to MongoDB Compass:
```
connect ECONNREFUSED 127.0.0.1:27017
connect ECONNREFUSED ::1:27017
```

### Common Causes & Solutions:

1. **MongoDB Service Not Running**
   - Open Services (Windows + R, type `services.msc`)
   - Look for "MongoDB" service
   - If stopped, right-click and select "Start"
   - If not found, reinstall MongoDB

2. **Wrong Connection String**
   - Check if MongoDB is running on a different port
   - Verify the connection string format:
     ```
     mongodb://localhost:27017/
     ```
   - For remote connections, use the actual IP instead of localhost

3. **Firewall Issues**
   - Check if port 27017 is blocked
   - Add MongoDB to Windows Firewall exceptions:
     1. Open Windows Defender Firewall
     2. Click "Allow an app through firewall"
     3. Add `mongod.exe` to the list

4. **Network Configuration**
   - If connecting remotely:
     - Ensure MongoDB is bound to correct IP (`bindIp` in mongod.conf)
     - Check if the server allows remote connections
     - Verify network connectivity between machines

### Quick Fixes:

1. **Restart MongoDB Service:**
   ```powershell
   net stop MongoDB
   net start MongoDB
   ```

2. **Verify MongoDB is Running:**
   ```bash
   mongosh
   ```

3. **Check MongoDB Configuration:**
   - Open mongod.conf (usually in C:\Program Files\MongoDB\Server\{version}\bin)
   - Verify bind_ip and port settings

4. **Reset MongoDB Compass:**
   - Delete saved connections
   - Try creating a new connection manually
   - Use the full connection string format

Still having issues? Check MongoDB logs for detailed error messages:
- Windows: Event Viewer > Applications and Services > MongoDB
- Manual location: C:\Program Files\MongoDB\Server\{version}\log\mongod.log

For more help, check the [MongoDB Documentation](https://docs.mongodb.com/manual/administration/configuration/)

## Still having issues?

If you're still experiencing problems, try:
1. Closing and reopening your terminal
2. Running `npm cache clean --force`
3. Deleting node_modules folder and running `npm install` again

For more help, check the [official Node.js documentation](https://nodejs.org/en/docs/) or create an issue in the project repository.
