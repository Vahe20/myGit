import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IndexService } from './IndexService';

const createFileSystem = (
  overrides: Partial<IFileSystem> = {},
): IFileSystem => ({
  read: jest.fn(),
  write: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
  ...overrides,
});

describe('IndexService', () => {
  const repositoryPaths = new RepositoryPaths('/repo');

  it('adds, gets, removes, and returns a copy of indexService entries', () => {
    const index = new IndexService(createFileSystem(), repositoryPaths);

    expect(index.add('a.txt', 'hash-a')).toBe(index);
    expect(index.get('a.txt')).toBe('hash-a');

    const copy = index.getAll();
    copy.set('b.txt', 'hash-b');

    expect(index.get('b.txt')).toBeUndefined();
    expect(index.remove('a.txt')).toBe(index);
    expect(index.get('a.txt')).toBeUndefined();
  });

  it('saves entries as json to the indexService path', async () => {
    const fileSystem = createFileSystem({
      write: jest.fn().mockResolvedValue(undefined),
    });
    const index = new IndexService(fileSystem, repositoryPaths).add(
      'a.txt',
      'hash-a',
    );

    await expect(index.save()).resolves.toBe(index);

    expect(fileSystem.write).toHaveBeenCalledWith(
      repositoryPaths.index(),
      Buffer.from(JSON.stringify([['a.txt', 'hash-a']], null, 2)),
    );
  });

  it('loads existing indexService entries', async () => {
    const index = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(true),
        read: jest.fn().mockResolvedValue(Buffer.from('[["a.txt","hash-a"]]')),
      }),
      repositoryPaths,
    );

    await index.load();

    expect(index.getAll()).toEqual(new Map([['a.txt', 'hash-a']]));
  });

  it('clears entries when the indexService file is missing or invalid', async () => {
    const index = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(false),
      }),
      repositoryPaths,
    ).add('stale.txt', 'hash');

    await index.load();
    expect(index.getAll()).toEqual(new Map());

    const invalidIndex = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(true),
        read: jest.fn().mockResolvedValue(Buffer.from('not json')),
      }),
      repositoryPaths,
    ).add('stale.txt', 'hash');

    await invalidIndex.load();
    expect(invalidIndex.getAll()).toEqual(new Map());
  });
});
