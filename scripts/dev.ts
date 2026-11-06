import { spawn } from 'bun';

const bunBin = process.execPath;

const serverProc = spawn([bunBin, 'run', 'server/index.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

const webProc = spawn([bunBin, './node_modules/vite/bin/vite.js', '--host', '--port', '5173'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

process.on('SIGINT', () => {
  serverProc.kill();
  webProc.kill();
  process.exit(0);
});

await Promise.all([serverProc.exited, webProc.exited]);
