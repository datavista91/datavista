// server/utils/logger.js

const log = (level, message, data) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] [${level}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [${level}] ${message}`);
  }
};

module.exports = {
  info: (msg, data) => log('INFO', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
  debug: (msg, data) => log('DEBUG', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
};
