module.exports = {
  apps: [
    {
      name: "chess",
      script: "./server.js",
      instances: 1,
      error_file: "./logs/chess-error.log",
      log_file: "./logs/chess-log.log",
      time: true,
      autorestart: true,
      exec_mode: "fork",
    },
  ],
};
