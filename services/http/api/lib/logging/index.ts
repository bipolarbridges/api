export function info(...msg: unknown[]):void {
  console.log('[INFO]', ...msg);
}

export function warn(...msg: unknown[]):void {
  console.log('[WARNING]', ...msg);
}

export function error(...msg: unknown[]):void {
  console.log('[ERROR]', ...msg);
}

export function debug(...msg: unknown[]):void {
  console.log('[DEBUG]', ...msg);
}

info('Logging enabled');
