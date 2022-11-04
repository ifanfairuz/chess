module.exports = {
  apps: [
    {
      name: "chess",
      script: "./server.js",
      instances: 1,
      error_file: "./logs/<app name>-error.log",
      log_file: "./logs/<app name>-log.log",
      time: true,
      autorestart: true,
      exec_mode: "fork",
    },
  ],
};
