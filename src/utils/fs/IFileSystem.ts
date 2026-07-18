export interface FileInfo {
  isFile: boolean;
  isDirectory: boolean;
}

export interface IFileSystem {
  read(filePath: string): Promise<Buffer>;
  write(filePath: string, data: Buffer): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  createDir(dirPath: string): Promise<void>;
  list(dirPath: string): Promise<string[]>;
  stat(path: string): Promise<FileInfo>;
}
