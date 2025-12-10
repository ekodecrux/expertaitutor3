module.exports = {
  apps: [{
    name: 'ai-professor',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/ai-professor/logs/error.log',
    out_file: '/var/www/ai-professor/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
