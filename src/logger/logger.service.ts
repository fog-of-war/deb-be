import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";

@Injectable()
export class LoggerService implements NestLoggerService {
  debug(message: any, ...optionalParams: any[]) {
    console.debug(`🐛 [${this.getCurrentSeoulTime()}] ${message}`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(`🚨 [${this.getCurrentSeoulTime()}] ${message}`, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(`🪵 [${this.getCurrentSeoulTime()}] ${message}`, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(`💥 [${this.getCurrentSeoulTime()}] ${message}`, ...optionalParams);
  }

  private getCurrentSeoulTime(): string {
    const now = new Date();
    const seoulTime = now.toLocaleString("en-US", {
      timeZone: "Asia/Seoul",
      hour12: false,
    });
    return seoulTime;
  }
}
