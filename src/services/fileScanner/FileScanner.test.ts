import path from 'node:path';

import { RepositoryPaths } from '../../configs/RepositoryPaths';
import {
  FileInfo,
  IFileSystem,
} from '../../infrastructure/fileSystem/IFileSystem';
import { FileScanner } from './FileScanner';

const file = (): FileInfo => ({ isFile: true, isDirectory: false });
const directory = (): FileInfo => ({ isFile: false, isDirectory: true });

describe('FileScanner', () => {
  const root = path.resolve('/repo');
  const gitPaths = new RepositoryPaths(root);

  it('returns files recursively using normalized relative paths', async () => {
    const srcDir = path.join(root, 'src');
    const nestedFile = path.join(srcDir, 'index.ts');
    const rootFile = path.join(root, 'README.md');

    const fileSystem: IFileSystem = {
      read: jest.fn().mockResolvedValue(Buffer.from('')),
      write: jest.fn(),
      exists: jest.fn().mockResolvedValue(false),
      createDir: jest.fn(),
      list: jest.fn(async (dirPath: string) => {
        if (dirPath === root) {
          return [srcDir, rootFile];
        }

        if (dirPath === srcDir) {
          return [nestedFile];
        }

        return [];
      }),
      stat: jest.fn(async (itemPath: string) => {
        if (itemPath === srcDir) {
          return directory();
        }

        return file();
      }),
    };

    await expect(new FileScanner(fileSystem, gitPaths).scan()).resolves.toEqual(
      ['src/index.ts', 'README.md'],
    );
  });

  it('skips .mygit and exact paths from ignoreService rules', async () => {
    const myGitDir = path.join(root, '.mygit');
    const ignoredFile = path.join(root, 'dist.js');
    const trackedFile = path.join(root, 'src.ts');

    const fileSystem: IFileSystem = {
      read: jest.fn().mockResolvedValue(Buffer.from('dist.js\n')),
      write: jest.fn(),
      exists: jest.fn().mockResolvedValue(true),
      createDir: jest.fn(),
      list: jest.fn().mockResolvedValue([myGitDir, ignoredFile, trackedFile]),
      stat: jest.fn().mockResolvedValue(file()),
    };

    await expect(new FileScanner(fileSystem, gitPaths).scan()).resolves.toEqual(
      ['src.ts'],
    );
    expect(fileSystem.stat).toHaveBeenCalledTimes(1);
    expect(fileSystem.stat).toHaveBeenCalledWith(trackedFile);
  });
});
