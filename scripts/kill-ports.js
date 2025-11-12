#!/usr/bin/env node
const { execSync } = require('child_process');

const PORTS = {
  backend: 3001,
  frontend: 3000
};

function killPort(port) {
  try {
    console.log(`🔍 Checking port ${port}...`);

    // Windows command to find process on port
    const command = `netstat -ano | findstr :${port} | findstr LISTENING`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

    if (output) {
      // Extract PID from netstat output
      const lines = output.trim().split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      });

      pids.forEach(pid => {
        console.log(`🔪 Killing process ${pid} on port ${port}...`);
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`✅ Process ${pid} killed successfully`);
        } catch (err) {
          console.log(`⚠️  Failed to kill process ${pid}`);
        }
      });
    } else {
      console.log(`✅ Port ${port} is free`);
    }
  } catch (err) {
    // No process found on port (which is good)
    console.log(`✅ Port ${port} is free`);
  }
}

function main() {
  console.log('\n========================================');
  console.log('  🧹 Cleaning up ports...');
  console.log('========================================\n');

  Object.entries(PORTS).forEach(([name, port]) => {
    killPort(port);
  });

  console.log('\n✨ All ports are ready!\n');
}

main();
