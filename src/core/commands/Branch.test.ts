import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IRefStore } from '../refs/IRefStore';
import { Branch } from './Branch';

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

const createRefStore = (overrides: Partial<IRefStore> = {}): IRefStore => ({
  getHeadRef: jest.fn(),
  setHeadRef: jest.fn(),
  getCurrentCommit: jest.fn(),
  getBranchCommit: jest.fn(),
  updateCurrentBranch: jest.fn(),
  ...overrides,
});

describe('Branch', () => {
  const repositoryPaths = new RepositoryPaths('/repo');

  it('creates a branch file pointing at the current commit', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });
    const refStore = createRefStore({
      getCurrentCommit: jest.fn().mockResolvedValue('commit-hash'),
    });

    await new Branch(fileSystem, repositoryPaths, refStore).execute('feature');

    expect(fileSystem.write).toHaveBeenCalledWith(
      repositoryPaths.branch('feature'),
      Buffer.from('commit-hash'),
    );
  });

  it('throws when there are no commits yet', async () => {
    const fileSystem = createFileSystem();
    const refStore = createRefStore({
      getCurrentCommit: jest.fn().mockResolvedValue(undefined),
    });

    await expect(
      new Branch(fileSystem, repositoryPaths, refStore).execute('feature'),
    ).rejects.toThrow('No commits yet');

    expect(fileSystem.write).not.toHaveBeenCalled();
  });

  it('throws when the branch already exists', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
    });
    const refStore = createRefStore({
      getCurrentCommit: jest.fn().mockResolvedValue('commit-hash'),
    });

    await expect(
      new Branch(fileSystem, repositoryPaths, refStore).execute('feature'),
    ).rejects.toThrow('Branch already exists');

    expect(fileSystem.write).not.toHaveBeenCalled();
  });
});
