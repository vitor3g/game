import { generateColors } from "@/shared/shared.utils";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose" | "fatal";

interface LoggerService {
  log(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;
  debug?(message: any, ...optionalParams: any[]): void;
  verbose?(message: any, ...optionalParams: any[]): void;
  fatal?(message: any, ...optionalParams: any[]): void;
  setLogLevels?(levels: LogLevel[]): void;
}

const colors = generateColors();
const resetColor = "\x1b[0m";

const logLevelColors: Record<LogLevel, string> = {
  log: "\x1b[37m",
  error: "\x1b[31m",
  warn: "\x1b[38;2;254;216;113m",
  debug: "\x1b[36m",
  verbose: "\x1b[35m",
  fatal: "\x1b[31;1m",
};

export class Logger implements LoggerService {
  private contextColor: string;
  private logLevels = new Set<LogLevel>([
    "log",
    "error",
    "warn",
    "debug",
    "verbose",
    "fatal",
  ]);

  constructor(private context: string) {
    const colorIndex = Math.floor(Math.random() * colors.length);
    this.contextColor = colors[colorIndex];

    this.log("initialized logger");
  }

  private formatMessage(level: LogLevel, message: any): string {
    const levelColor = logLevelColors[level] || resetColor;
    return `${this.contextColor}[${
      this.context
    }]:${resetColor}${levelColor} ${message}${resetColor}`;
  }

  private logToConsole(
    level: LogLevel,
    message: any,
    optionalParams: any[],
  ): void {
    if (this.logLevels.has(level)) {
      console.log(this.formatMessage(level, message), ...optionalParams);
    }
  }

  log(message: any, ...optionalParams: any[]): void {
    this.logToConsole("log", message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.logToConsole("error", message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.logToConsole("warn", message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]): void {
    this.logToConsole("debug", message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]): void {
    this.logToConsole("verbose", message, optionalParams);
  }

  fatal?(message: any, ...optionalParams: any[]): void {
    this.logToConsole("fatal", message, optionalParams);
  }

  setLogLevels?(levels: LogLevel[]): void {
    this.logLevels = new Set(levels);
  }
}
