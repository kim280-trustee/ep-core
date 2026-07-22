type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "debug";

interface LogPayload {
  message: string;
  data?: unknown;
}

class Logger {
  private log(
    level: LogLevel,
    payload: LogPayload,
  ): void {
    const timestamp = new Date().toISOString();

    const entry = {
      timestamp,
      level,
      ...payload,
    };

    switch (level) {
      case "error":
        console.error(entry);
        break;

      case "warn":
        console.warn(entry);
        break;

      case "debug":
        console.debug(entry);
        break;

      default:
        console.info(entry);
    }
  }

  info(message: string, data?: unknown): void {
    this.log("info", {
      message,
      data,
    });
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", {
      message,
      data,
    });
  }

  error(message: string, data?: unknown): void {
    this.log("error", {
      message,
      data,
    });
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", {
      message,
      data,
    });
  }
}

export const logger = new Logger();