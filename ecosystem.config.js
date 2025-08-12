module.exports = {
  apps: [
    {
      name: 'hopeinternationalcare',
      cwd: '/home/root/projects/hopeinternationalcare',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/root/projects/hopeinternationalcare/logs/err.log',
      out_file: '/home/root/projects/hopeinternationalcare/logs/out.log',
      log_file: '/home/root/projects/hopeinternationalcare/logs/combined.log',
      time: true,
    },
  ],
};
// don't change anything here, unless you know what you chagning,