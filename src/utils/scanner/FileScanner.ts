import path from 'node:path';

import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../fs/IFileSystem';
import { Ignore } from '../ignore/Ignore';
import { PathNormalizer } from '../normalizer/PathNormalizer';
import { IFileScanner } from './IFileScanner';

export class FileScanner implements IFileScanner {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly gitPaths: GitPaths,
  ) {}

  public async scan(): Promise<string[]> {
    const rootPath = this.gitPaths.base();
    const result: string[] = [];
    const ignoreRules = await Ignore(this.fileSystem, this.gitPaths);

    await this.directoryScan(rootPath, rootPath, result, ignoreRules);

    return result;
  }

  private async directoryScan(
    rootPath: string,
    currentPath: string,
    result: string[],
    ignoreRules: string[],
  ): Promise<void> {
    const list = await this.fileSystem.list(currentPath);

    for (const item of list) {
      const relativePath = PathNormalizer(path.relative(rootPath, item));

      if (ignoreRules.includes(relativePath) || relativePath === '.mygit') {
        continue;
      }

      const info = await this.fileSystem.stat(item);

      if (info.isFile) {
        result.push(relativePath);
      } else if (info.isDirectory) {
        await this.directoryScan(rootPath, item, result, ignoreRules);
      }
    }
  }
}
