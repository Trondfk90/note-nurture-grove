
const { spawn } = require('child_process');
const { resolve } = require('path');
const { createServer } = require('vite');
const waitOn = require('wait-on');

const startVite = async () => {
  const vite = await createServer();
  await vite.listen();
  return vite;
};

const startElectron = async () => {
  const electron = spawn('electron', [resolve(__dirname, 'electron/main.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  electron.on('close', () => {
    process.exit();
  });
};

const main = async () => {
  const vite = await startVite();

  // Wait for the Vite server to be available
  await waitOn({ resources: ['http://localhost:8080'] });

  await startElectron();

  process.on('SIGINT', async () => {
    await vite.close();
    process.exit();
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
