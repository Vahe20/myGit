export type LogValue = unknown;

export interface ILogger {
  info(...message: LogValue[]): void;
  success(...message: LogValue[]): void;
  warn(...message: LogValue[]): void;
  error(...message: LogValue[]): void;
}
