import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { Logger } from '../../utils/logger/Logger';
import { CommitObject } from '../objects/CommitObject';
import { IObjectStore } from '../objects/IObjectStore';
import { Log } from './Log';

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

describe('Log', () => {
  const gitPaths = new GitPaths('/repo');

  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns without logging when current branch has no commits', async () => {
    const fileSystem = createFileSystem({
      read: jest.fn().mockResolvedValue(Buffer.from('ref: refs/heads/main\n')),
      exists: jest.fn().mockResolvedValue(false),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      read: jest.fn(),
      buildPath: jest.fn(),
    };
    const logger = new Logger();
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'info');

    await new Log(fileSystem, objectStore, gitPaths, logger).execute();

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('logs commits by walking parent links', async () => {
    const fileSystem = createFileSystem({
      read: jest
        .fn()
        .mockResolvedValueOnce(Buffer.from('ref: refs/heads/main\n'))
        .mockResolvedValueOnce(Buffer.from('child-hash\n')),
      exists: jest.fn().mockResolvedValue(true),
    });
    const child = new CommitObject({
      tree: 'tree-child',
      parent: 'parent-hash',
      author: 'vahe',
      message: 'child commit',
    }).serialize();
    const parent = new CommitObject({
      tree: 'tree-parent',
      author: 'vahe',
      message: 'parent commit',
    }).serialize();
    const objectStore: IObjectStore = {
      save: jest.fn(),
      read: jest
        .fn()
        .mockResolvedValueOnce(child)
        .mockResolvedValueOnce(parent),
      buildPath: jest.fn(),
    };
    const logger = new Logger();
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'info');

    await new Log(fileSystem, objectStore, gitPaths, logger).execute();

    expect(objectStore.read).toHaveBeenCalledWith('child-hash');
    expect(objectStore.read).toHaveBeenCalledWith('parent-hash');
    expect(logger.warn).toHaveBeenCalledWith('commit:', 'child-hash');
    expect(logger.warn).toHaveBeenCalledWith('commit:', 'parent-hash');
    expect(logger.info).toHaveBeenCalledWith('parent:', 'parent-hash');
    expect(logger.info).toHaveBeenCalledWith('\tchild commit');
    expect(logger.info).toHaveBeenCalledWith('\tparent commit');
  });

  it('rejects detached HEAD', async () => {
    const fileSystem = createFileSystem({
      read: jest.fn().mockResolvedValue(Buffer.from('commit-hash\n')),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      read: jest.fn(),
      buildPath: jest.fn(),
    };

    await expect(
      new Log(fileSystem, objectStore, gitPaths, new Logger()).execute(),
    ).rejects.toThrow('Detached HEAD not supported');
  });
});
