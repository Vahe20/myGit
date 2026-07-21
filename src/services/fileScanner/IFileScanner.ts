export interface IFileScanner {
  scan(): Promise<string[]>;
}
