import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from '../indexService/IIndexService';
import { Rm } from './Rm';

const createFileSystem = (): IFileSystem => ({
  read: jest.fn(async (filePath: string) => Buffer.from(`data:${filePath}`)),
  write: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
});

const createIndex = (entries: [string, string][]): IIndexService => {
  const map = new Map(entries);

  const index: IIndexService = {
    add: jest.fn().mockReturnThis(),
    get: jest.fn((path: string) => map.get(path)),
    has: jest.fn((path: string) => map.has(path)),
    remove: jest.fn((path: string) => {
      map.delete(path);
      return index;
    }),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn(),
    getAll: jest.fn(() => map),
  };

  jest.mocked(index.load).mockResolvedValue(index);

  return index;
};

describe('Rm', () => {
  it('removes file from indexService and working tree', async () => {
    const fileSystem = createFileSystem();

    const index = createIndex([
      ['README.md', 'READMEHash'],
      ['Cli.ts', 'CliHash'],
    ]);

    await new Rm(fileSystem, index).execute('Cli.ts');

    expect(index.load).toHaveBeenCalledTimes(1);

    expect(index.remove).toHaveBeenCalledWith('Cli.ts');

    expect(index.save).toHaveBeenCalledTimes(1);

    expect(fileSystem.delete).toHaveBeenCalledWith('Cli.ts');
  });

  it('saves indexService before deleting file', async () => {
    const calls: string[] = [];

    const fileSystem = createFileSystem();

    fileSystem.delete = jest.fn(async () => {
      calls.push('delete');
    });

    const index = createIndex([
      ['README.md', 'READMEHash'],
      ['Cli.ts', 'CliHash'],
    ]);

    index.save = jest.fn(async () => {
      calls.push('save');
      return index;
    });

    await new Rm(fileSystem, index).execute('Cli.ts');

    expect(calls).toEqual(['save', 'delete']);
  });

  it('throws when file deletion fails', async () => {
    const fileSystem = createFileSystem();

    fileSystem.delete = jest.fn().mockRejectedValue(new Error('Delete failed'));

    const index = createIndex([
      ['README.md', 'READMEHash'],
      ['Cli.ts', 'CliHash'],
    ]);

    await expect(new Rm(fileSystem, index).execute('Cli.ts')).rejects.toThrow(
      'Delete failed',
    );
  });

  it('throws when file is not tracked', async () => {
    const fileSystem = createFileSystem();

    const index = createIndex([]);

    index.has = jest.fn().mockReturnValue(false);

    await expect(
      new Rm(fileSystem, index).execute('missing.ts'),
    ).rejects.toThrow('File is not tracked');

    expect(fileSystem.delete).not.toHaveBeenCalled();
  });
});
