import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { Repository } from './Repository';

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

describe('Repository', () => {
  const repositoryPaths = new RepositoryPaths('/repo');

  it('creates repository directories and default files', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });

    await new Repository(fileSystem, repositoryPaths).init();

    expect(fileSystem.createDir).toHaveBeenCalledWith(repositoryPaths.myGit());
    expect(fileSystem.createDir).toHaveBeenCalledWith(
      repositoryPaths.objects(),
    );
    expect(fileSystem.createDir).toHaveBeenCalledWith(repositoryPaths.refs());
    expect(fileSystem.write).toHaveBeenCalledWith(
      repositoryPaths.head(),
      Buffer.from('ref: refs/heads/main\n'),
    );
    expect(fileSystem.write).toHaveBeenCalledWith(
      repositoryPaths.index(),
      Buffer.from(''),
    );
  });

  it('does not overwrite existing HEAD or indexService files', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
    });

    await new Repository(fileSystem, repositoryPaths).init();

    expect(fileSystem.write).not.toHaveBeenCalled();
  });
});
