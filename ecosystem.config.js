module.exports = {
  apps: [
    {
      name: "hci-node",
      script: "dist/app.js",
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
