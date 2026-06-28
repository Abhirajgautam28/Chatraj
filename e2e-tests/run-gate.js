const { execSync } = require('child_process');

let command = 'npx playwright test';

// Check if we are on a Linux environment without a display, typically requiring xvfb
if (process.platform === 'linux' && !process.env.DISPLAY && process.env.CI !== 'true') {
  command = `xvfb-run -a ${command}`;
}

const args = process.argv.slice(2).join(' ');
if (args) {
    command += ` ${args}`;
}

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status || 1);
}
