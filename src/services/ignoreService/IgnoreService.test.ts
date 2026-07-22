import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IgnoreService } from './IgnoreService';

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

describe('IgnoreService', () => {
  const repositoryPaths = new RepositoryPaths('/repo');

  it('returns an empty list when ignore file is missing', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });

    await expect(
      new IgnoreService(fileSystem, repositoryPaths).loadRules(),
    ).resolves.toEqual([]);
    expect(fileSystem.read).not.toHaveBeenCalled();
  });

  it('reads non-empty and non-comment ignore rules', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest
        .fn()
        .mockResolvedValue(
          Buffer.from('# comment\n\nnode_modules\n  dist/  \r\n*.log\n'),
        ),
    });

    await expect(
      new IgnoreService(fileSystem, repositoryPaths).loadRules(),
    ).resolves.toMatchObject([
      { pattern: 'node_modules', directoryOnly: false, hasSlash: false },
      { pattern: 'dist', directoryOnly: true, hasSlash: false },
      { pattern: '*.log', directoryOnly: false, hasSlash: false },
    ]);
  });

  it('always ignores repository internals', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });
    const ignoreService = new IgnoreService(fileSystem, repositoryPaths);

    await expect(ignoreService.isIgnored('.mygit')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('.mygit/HEAD')).resolves.toBe(true);
  });

  it('matches exact names at any path segment', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue(Buffer.from('node_modules\n')),
    });
    const ignoreService = new IgnoreService(fileSystem, repositoryPaths);

    await expect(ignoreService.isIgnored('node_modules')).resolves.toBe(true);
    await expect(
      ignoreService.isIgnored('src/node_modules/lib.js'),
    ).resolves.toBe(true);
    await expect(
      ignoreService.isIgnored('src/node_module/lib.js'),
    ).resolves.toBe(false);
  });

  it('matches directory-only rules for directory contents', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue(Buffer.from('dist/\n')),
    });
    const ignoreService = new IgnoreService(fileSystem, repositoryPaths);

    await expect(ignoreService.isIgnored('dist')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('dist/app.js')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('src/dist/app.js')).resolves.toBe(
      true,
    );
    expect(await ignoreService.isIgnored('distribution')).toBe(false);
  });

  it('matches wildcard rules', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue(Buffer.from('*.log\nsrc/*.tmp\n')),
    });
    const ignoreService = new IgnoreService(fileSystem, repositoryPaths);

    await expect(ignoreService.isIgnored('debug.log')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('logs/debug.log')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('src/cache.tmp')).resolves.toBe(true);
    await expect(ignoreService.isIgnored('src/nested/cache.tmp')).resolves.toBe(
      false,
    );
  });

  it('caches loaded rules', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue(Buffer.from('*.log\n')),
    });
    const ignoreService = new IgnoreService(fileSystem, repositoryPaths);

    await ignoreService.isIgnored('a.log');
    await ignoreService.isIgnored('b.log');

    expect(fileSystem.read).toHaveBeenCalledTimes(1);
  });
});
