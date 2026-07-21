import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { CommitObject } from '../objects/CommitObject';
import { RefStore } from '../refs/RefStore';
import { CommitTree } from './CommitTree';

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

describe('CommitTree', () => {
  const gitPaths = new RepositoryPaths('/repo');
  const branchPath = gitPaths.ref('refs/heads/main');

  it('creates an initial commit and updates the current branch', async () => {
    const fileSystem = createFileSystem({
      read: jest.fn().mockResolvedValue(Buffer.from('ref: refs/heads/main\n')),
      exists: jest.fn().mockResolvedValue(false),
    });
    const refStore = new RefStore(fileSystem, gitPaths);
    const objectStore: IObjectStore = {
      save: jest.fn().mockResolvedValue('commit-hash'),
      read: jest.fn(),
      buildPath: jest.fn(),
    };

    await expect(
      new CommitTree(objectStore, refStore).execute(
        'tree-hash',
        'initial commit',
      ),
    ).resolves.toBe('commit-hash');

    expect(objectStore.save).toHaveBeenCalledWith(
      new CommitObject({
        tree: 'tree-hash',
        author: 'vahe',
        message: 'initial commit',
      }).serialize(),
    );
    expect(fileSystem.write).toHaveBeenCalledWith(
      branchPath,
      Buffer.from('commit-hash'),
    );
  });

  it('includes parent hash when the current branch exists', async () => {
    const fileSystem = createFileSystem({
      read: jest
        .fn()
        .mockResolvedValueOnce(Buffer.from('ref: refs/heads/main\n'))
        .mockResolvedValueOnce(Buffer.from('parent-hash\n'))
        .mockResolvedValueOnce(Buffer.from('ref: refs/heads/main\n')),
      exists: jest.fn().mockResolvedValue(true),
    });
    const refStore = new RefStore(fileSystem, gitPaths);
    const objectStore: IObjectStore = {
      save: jest.fn().mockResolvedValue('commit-hash'),
      read: jest.fn(),
      buildPath: jest.fn(),
    };

    await new CommitTree(objectStore, refStore).execute(
      'tree-hash',
      'next commit',
    );

    expect(objectStore.save).toHaveBeenCalledWith(
      new CommitObject({
        tree: 'tree-hash',
        parent: 'parent-hash',
        author: 'vahe',
        message: 'next commit',
      }).serialize(),
    );
  });

  it('rejects detached HEAD', async () => {
    const fileSystem = createFileSystem({
      read: jest.fn().mockResolvedValue(Buffer.from('commit-hash\n')),
    });
    const refStore = new RefStore(fileSystem, gitPaths);
    const objectStore: IObjectStore = {
      save: jest.fn(),
      read: jest.fn(),
      buildPath: jest.fn(),
    };

    await expect(
      new CommitTree(objectStore, refStore).execute('tree-hash', 'message'),
    ).rejects.toThrow('Detached HEAD not supported');
  });
});
