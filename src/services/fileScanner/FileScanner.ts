import path from 'node:path';

import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { PathNormalizer } from '../../utils/normalizer/PathNormalizer';
import { IgnoreService } from '../ignoreService/IgnoreService';
import { IFileScanner } from './IFileScanner';

export class FileScanner implements IFileScanner {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly gitPaths: RepositoryPaths,
    private readonly ignoreService = new IgnoreService(fileSystem, gitPaths),
  ) {}

  public async scan(): Promise<string[]> {
    const rootPath = this.gitPaths.base();
    const result: string[] = [];

    await this.directoryScan(rootPath, rootPath, result);

    return result;
  }

  private async directoryScan(
    rootPath: string,
    currentPath: string,
    result: string[],
  ): Promise<void> {
    const list = await this.fileSystem.list(currentPath);

    for (const item of list) {
      const relativePath = PathNormalizer(path.relative(rootPath, item));

      if (await this.ignoreService.isIgnored(relativePath)) {
        continue;
      }

      const info = await this.fileSystem.stat(item);

      if (info.isFile) {
        result.push(relativePath);
      } else if (info.isDirectory) {
        await this.directoryScan(rootPath, item, result);
      }
    }
  }
}
