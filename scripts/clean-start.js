#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');

const PORTS = {
  backend: 3001,
  frontend: 3000
};

function killPort(port) {
  try {
    const command = `netstat -ano | findstr :${port} | findstr LISTENING`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

    if (output) {
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
          console.log(`✅ Process ${pid} killed`);
        } catch (err) {
          console.log(`⚠️  Failed to kill process ${pid}`);
        }
      });
    }
  } catch (err) {
    // No process found on port
  }
}

function startService(service) {
  console.log(`\n🚀 Starting ${service}...\n`);

  if (service === 'backend') {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'inherit',
      shell: true
    });

    proc.on('error', (err) => {
      console.error('❌ Failed to start backend:', err);
      process.exit(1);
    });

  } else if (service === 'frontend') {
    const proc = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '..', 'frontend'),
      stdio: 'inherit',
      shell: true
    });

    proc.on('error', (err) => {
      console.error('❌ Failed to start frontend:', err);
      process.exit(1);
    });

  } else {
    // Start both using concurrently
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    proc.on('error', (err) => {
      console.error('❌ Failed to start services:', err);
      process.exit(1);
    });
  }
}

function main() {
  const mode = process.argv[2]; // backend, frontend, or undefined (both)

  console.log('\n========================================');
  console.log('  🪐 Cosmic Drift - Clean Start');
  console.log('========================================\n');

  if (mode === 'backend') {
    console.log('📦 Mode: Backend Only');
    killPort(PORTS.backend);
    startService('backend');
  } else if (mode === 'frontend') {
    console.log('🎨 Mode: Frontend Only');
    killPort(PORTS.frontend);
    startService('frontend');
  } else {
    console.log('🌌 Mode: Full Stack');
    killPort(PORTS.backend);
    killPort(PORTS.frontend);
    startService('both');
  }
}

main();
