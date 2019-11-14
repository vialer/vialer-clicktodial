import { spawn } from 'child_process';

const processes = [];

function killAll(e) {
  if (e) {
    console.log(e);
  }
  processes.forEach(process => {
    if (!process.killed) {
      process.kill();
    }
  });
}

export default function childProcesses(...processStrings) {
  processStrings.forEach(processString => {
    const [bin, ...instructions] = processString.split(' ');
    const process = spawn(bin, instructions, { stdio: 'inherit' });

    process.on('error', killAll);
    process.on('exit', killAll);
    process.on('disconnect', killAll);
    process.on('close', killAll);

    processes.push(process);
  });
}
