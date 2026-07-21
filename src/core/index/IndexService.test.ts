import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { IndexService } from './IndexService';

const createFileSystem = (
  overrides: Partial<IFileSystem> = {},
): IFileSystem => ({
  read: jest.fn(),
  write: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
  ...overrides,
});

describe('IndexService', () => {
  const gitPaths = new GitPaths('/repo');

  it('adds, gets, removes, and returns a copy of index entries', () => {
    const index = new IndexService(createFileSystem(), gitPaths);

    expect(index.add('a.txt', 'hash-a')).toBe(index);
    expect(index.get('a.txt')).toBe('hash-a');

    const copy = index.getAll();
    copy.set('b.txt', 'hash-b');

    expect(index.get('b.txt')).toBeUndefined();
    expect(index.remove('a.txt')).toBe(index);
    expect(index.get('a.txt')).toBeUndefined();
  });

  it('saves entries as json to the index path', async () => {
    const fileSystem = createFileSystem({
      write: jest.fn().mockResolvedValue(undefined),
    });
    const index = new IndexService(fileSystem, gitPaths).add('a.txt', 'hash-a');

    await expect(index.save()).resolves.toBe(index);

    expect(fileSystem.write).toHaveBeenCalledWith(
      gitPaths.index(),
      Buffer.from(JSON.stringify([['a.txt', 'hash-a']], null, 2)),
    );
  });

  it('loads existing index entries', async () => {
    const index = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(true),
        read: jest.fn().mockResolvedValue(Buffer.from('[["a.txt","hash-a"]]')),
      }),
      gitPaths,
    );

    await index.load();

    expect(index.getAll()).toEqual(new Map([['a.txt', 'hash-a']]));
  });

  it('clears entries when the index file is missing or invalid', async () => {
    const index = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(false),
      }),
      gitPaths,
    ).add('stale.txt', 'hash');

    await index.load();
    expect(index.getAll()).toEqual(new Map());

    const invalidIndex = new IndexService(
      createFileSystem({
        exists: jest.fn().mockResolvedValue(true),
        read: jest.fn().mockResolvedValue(Buffer.from('not json')),
      }),
      gitPaths,
    ).add('stale.txt', 'hash');

    await invalidIndex.load();
    expect(invalidIndex.getAll()).toEqual(new Map());
  });
});
