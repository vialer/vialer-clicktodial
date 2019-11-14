import { spawn } from 'child_process';

export default async function spawnProcess(bin, ...args) {
  return new Promise((resolve, reject) => {
    const process = spawn(bin, args, {stdio: 'inherit'});
    process.on('error', reject);
    process.on('exit', resolve);
  });
}

