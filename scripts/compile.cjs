const { spawnSync } = require('child_process');
const os = require('os');

const contractPath = 'contracts/noxballot.compact';
const outputPath = 'contracts/managed/noxballot';

let cmd;
let args;

if (process.platform === 'win32') {
  // On Windows, use WSL where compact is installed in ~/.local/bin/compact
  cmd = 'wsl';
  args = ['~/.local/bin/compact', 'compile', contractPath, outputPath];
} else {
  // On Linux / GitHub Actions CI, compact is installed in PATH via setup-compact-action
  cmd = 'compact';
  args = ['compile', contractPath, outputPath];
}

console.log(`[Compile] Executing: ${cmd} ${args.join(' ')}`);
const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true });

if (result.error) {
  console.error('[Compile] Failed to start compile process:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
