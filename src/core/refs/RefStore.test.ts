import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { RefStore } from './RefStore';

const createFileSystem = (): IFileSystem => ({
  read: jest.fn(),
  write: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
});

const createRepositoryPaths = (): RepositoryPaths => {
  return {
    head: jest.fn(() => '.mygit/HEAD'),
    ref: jest.fn((ref: string) => `.mygit/${ref}`),
  } as unknown as RepositoryPaths;
};

describe('RefStore', () => {
  describe('getHeadRef', () => {
    it('returns current branch ref', async () => {
      const fileSystem = createFileSystem();
      const repositoryPaths = createRepositoryPaths();

      fileSystem.read = jest
        .fn()
        .mockResolvedValue(Buffer.from('ref: refs/heads/main\n'));

      const refStore = new RefStore(fileSystem, repositoryPaths);

      await expect(refStore.getHeadRef()).resolves.toBe('refs/heads/main');

      expect(repositoryPaths.head).toHaveBeenCalled();
    });

    it('throws error when HEAD is detached', async () => {
      const fileSystem = createFileSystem();
      const repositoryPaths = createRepositoryPaths();

      fileSystem.read = jest.fn().mockResolvedValue(Buffer.from('abc123'));

      const refStore = new RefStore(fileSystem, repositoryPaths);

      await expect(refStore.getHeadRef()).rejects.toThrow(
        'Detached HEAD not supported',
      );
    });
  });

  describe('getCurrentCommit', () => {
    it('returns current commit hash', async () => {
      const fileSystem = createFileSystem();
      const repositoryPaths = createRepositoryPaths();

      fileSystem.read = jest.fn().mockImplementation(async (path: string) => {
        if (path === '.mygit/HEAD') {
          return Buffer.from('ref: refs/heads/main');
        }

        return Buffer.from('commit-hash');
      });

      fileSystem.exists = jest.fn().mockResolvedValue(true);

      const refStore = new RefStore(fileSystem, repositoryPaths);

      await expect(refStore.getCurrentCommit()).resolves.toBe('commit-hash');

      expect(repositoryPaths.ref).toHaveBeenCalledWith('refs/heads/main');
    });

    it('returns undefined when branch does not exist', async () => {
      const fileSystem = createFileSystem();
      const repositoryPaths = createRepositoryPaths();

      fileSystem.read = jest
        .fn()
        .mockResolvedValue(Buffer.from('ref: refs/heads/main'));

      fileSystem.exists = jest.fn().mockResolvedValue(false);

      const refStore = new RefStore(fileSystem, repositoryPaths);

      await expect(refStore.getCurrentCommit()).resolves.toBeUndefined();
    });
  });

  describe('updateCurrentBranch', () => {
    it('updates current branch commit hash', async () => {
      const fileSystem = createFileSystem();
      const repositoryPaths = createRepositoryPaths();

      fileSystem.read = jest
        .fn()
        .mockResolvedValue(Buffer.from('ref: refs/heads/main'));

      const refStore = new RefStore(fileSystem, repositoryPaths);

      await refStore.updateCurrentBranch('new-commit-hash');

      expect(fileSystem.write).toHaveBeenCalledWith(
        repositoryPaths.ref('refs/heads/main'),
        Buffer.from('new-commit-hash'),
      );
    });
  });
});
