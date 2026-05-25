// Central logging utility for VR&E backend ingestion pipeline
export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

function getTimestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (msg) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.blue}[INFO]${colors.reset} ${msg}`);
  },
  success: (msg) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.bright}${colors.green}[SUCCESS]${colors.reset} ${msg}`);
  },
  warn: (msg) => {
    console.warn(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${msg}`);
  },
  error: (msg, err = null) => {
    console.error(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${msg}`);
    if (err) {
      console.error(err);
    }
  }
};
