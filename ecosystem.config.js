module.exports = {
  apps: [
    {
      name: "chess",
      script: "./server.js",
      error_file: "./logs/chess-error.log",
      log_file: "./logs/chess-log.log",
      time: true,
      autorestart: true,
      exec_mode: "fork",
      max_memory_restart: "512M",
    },
  ],
};
