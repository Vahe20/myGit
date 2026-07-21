import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { FileScanner } from '../../services/fileScanner/FileScanner';
import { IIndexService } from '../index/IIndexService';
import { Status } from './Status';

const createIndex = (entries: [string, string][]): IIndexService => {
  const index: IIndexService = {
    add: jest.fn().mockReturnThis(),
    get: jest.fn(),
    remove: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map(entries)),
  };

  jest.mocked(index.load).mockResolvedValue(index);

  return index;
};

describe('Status', () => {
  it('reports modified, untracked, and staged files', async () => {
    const fileSystem: IFileSystem = {
      read: jest.fn(async (filePath: string) => Buffer.from(filePath)),
      write: jest.fn(),
      exists: jest.fn(),
      createDir: jest.fn(),
      list: jest.fn(),
      stat: jest.fn(),
    };
    const scanner = {
      scan: jest.fn().mockResolvedValue(['tracked.txt', 'new.txt']),
    } as unknown as FileScanner;
    const index = createIndex([
      ['tracked.txt', 'old-hash'],
      ['staged-only.txt', 'staged-hash'],
    ]);
    const hashService: IHashService = {
      hash: jest
        .fn()
        .mockResolvedValueOnce('new-tracked-hash')
        .mockResolvedValueOnce('new-file-hash'),
    };

    await expect(
      new Status(fileSystem, scanner, index, hashService).execute(),
    ).resolves.toEqual({
      modified: [{ path: 'tracked.txt', hash: 'new-tracked-hash' }],
      untracked: [{ path: 'new.txt', hash: 'new-file-hash' }],
      staged: [
        { path: 'tracked.txt', hash: 'old-hash' },
        { path: 'staged-only.txt', hash: 'staged-hash' },
      ],
    });
  });
});
