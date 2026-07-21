import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { Repository } from './Repository';

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

describe('Repository', () => {
  const gitPaths = new GitPaths('/repo');

  it('creates repository directories and default files', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });

    await new Repository(fileSystem, gitPaths).init();

    expect(fileSystem.createDir).toHaveBeenCalledWith(gitPaths.myGit());
    expect(fileSystem.createDir).toHaveBeenCalledWith(gitPaths.objects());
    expect(fileSystem.createDir).toHaveBeenCalledWith(gitPaths.refs());
    expect(fileSystem.write).toHaveBeenCalledWith(
      gitPaths.head(),
      Buffer.from('ref: refs/heads/main\n'),
    );
    expect(fileSystem.write).toHaveBeenCalledWith(
      gitPaths.index(),
      Buffer.from(''),
    );
  });

  it('does not overwrite existing HEAD or index files', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
    });

    await new Repository(fileSystem, gitPaths).init();

    expect(fileSystem.write).not.toHaveBeenCalled();
  });
});
