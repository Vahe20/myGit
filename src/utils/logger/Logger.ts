type MessageType = 'info' | 'error' | 'warn' | 'success';

export class Logger {
  private readonly colors: Record<MessageType, number> = {
    info: 36, // cyan
    success: 32, // green
    warn: 33, // yellow
    error: 31, // red
  };

  private log(type: MessageType, ...message: string[]) {
    const color = this.colors[type];
    let text = '';

    for (const str of message) {
      text += ' ' + str;
    }

    console.log(`\x1b[${color}m${text}\x1b[0m`);
  }

  public info(...message: string[]) {
    this.log('info', ...message);
  }

  public success(...message: string[]) {
    this.log('success', ...message);
  }

  public warn(...message: string[]) {
    this.log('warn', ...message);
  }

  public error(...message: string[]) {
    this.log('error', ...message);
  }
}
