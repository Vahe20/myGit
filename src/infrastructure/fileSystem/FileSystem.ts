import * as fs from 'node:fs/promises';
import path from 'node:path';

import { FileInfo, IFileSystem } from './IFileSystem';

export class FileSystem implements IFileSystem {
  public async createDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, {
      recursive: true,
    });
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async read(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  public async write(filePath: string, data: Buffer): Promise<void> {
    await fs.mkdir(path.dirname(filePath), {
      recursive: true,
    });

    await fs.writeFile(filePath, data);
  }

  public async list(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    try {
      const entries = await fs.readdir(dirPath);

      for (const entry of entries) {
        files.push(path.join(dirPath, entry));
      }
    } catch (err) {
      console.error(err);
    }

    return files;
  }
  public async stat(path: string): Promise<FileInfo> {
    const stats = await fs.stat(path);

    return {
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  }
}
