const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, data) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${timestamp()} ${msg}`, data || '');
  },
  success: (msg, data) => {
    console.log(`${colors.green}[OK]${colors.reset} ${timestamp()} ${msg}`, data || '');
  },
  warn: (msg, data) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp()} ${msg}`, data || '');
  },
  error: (msg, err) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp()} ${msg}`, err?.message || err || '');
  },
};
