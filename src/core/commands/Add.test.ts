import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { FileScanner } from '../../services/fileScanner/FileScanner';
import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { Add } from './Add';

const createFileSystem = (): IFileSystem => ({
  read: jest.fn(async (filePath: string) => Buffer.from(`data:${filePath}`)),
  write: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
});

const createIndex = (): IIndexService => {
  const indexService: IIndexService = {
    add: jest.fn().mockReturnThis(),
    get: jest.fn(),
    has: jest.fn(),
    remove: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map()),
    clear: jest.fn(),
  };

  jest.mocked(indexService.load).mockResolvedValue(indexService);

  return indexService;
};

describe('Add', () => {
  it('adds one file to the object store and indexService', async () => {
    const fileSystem = createFileSystem();
    const scanner = { scan: jest.fn() } as unknown as FileScanner;
    const objectStore: IObjectStore = {
      save: jest.fn().mockResolvedValue('blob-hash'),
      read: jest.fn(),
      buildPath: jest.fn(),
    };
    const index = createIndex();

    await new Add(fileSystem, scanner, objectStore, index).execute('README.md');

    expect(fileSystem.read).toHaveBeenCalledWith('README.md');
    expect(objectStore.save).toHaveBeenCalledWith(
      Buffer.from('blob 14\0data:README.md'),
    );
    expect(index.add).toHaveBeenCalledWith('README.md', 'blob-hash');
    expect(index.save).toHaveBeenCalledTimes(1);
    expect(scanner.scan).not.toHaveBeenCalled();
  });

  it('adds every scanned file when path is dot', async () => {
    const fileSystem = createFileSystem();
    const scanner = {
      scan: jest.fn().mockResolvedValue(['a.txt', 'src/b.ts']),
    } as unknown as FileScanner;
    const objectStore: IObjectStore = {
      save: jest
        .fn()
        .mockResolvedValueOnce('hash-a')
        .mockResolvedValueOnce('hash-b'),
      read: jest.fn(),
      buildPath: jest.fn(),
    };
    const index = createIndex();

    await new Add(fileSystem, scanner, objectStore, index).execute('.');

    expect(scanner.scan).toHaveBeenCalledTimes(1);
    expect(index.add).toHaveBeenCalledWith('a.txt', 'hash-a');
    expect(index.add).toHaveBeenCalledWith('src/b.ts', 'hash-b');
    expect(index.save).toHaveBeenCalledTimes(1);
  });
});
