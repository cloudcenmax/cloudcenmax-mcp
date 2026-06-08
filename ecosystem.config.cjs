// PM2 process file. Kept as .cjs so Node treats it as CommonJS even though
// package.json sets "type": "module".
module.exports = {
  apps: [
    {
      name: 'cloudcenmax-mcp',
      script: 'dist/server.js',
      cwd: '/home/mcp/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: '3399',
        CLOUDCENMAX_API_BASE: 'https://cloudcenmax.com',
      },
      out_file: '/home/mcp/logs/out.log',
      error_file: '/home/mcp/logs/err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
