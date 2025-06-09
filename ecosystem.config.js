module.exports = {
  apps: [{
    name: 'mysafety-app',
    script: 'dist/index.js',
    cwd: '/var/www/mysafety',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '.env.production',
    error_file: '/var/log/pm2/mysafety-error.log',
    out_file: '/var/log/pm2/mysafety-out.log',
    log_file: '/var/log/pm2/mysafety-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}; 