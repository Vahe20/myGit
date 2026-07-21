import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../fs/IFileSystem';
import { Ignore } from './Ignore';

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

describe('Ignore', () => {
  const gitPaths = new GitPaths('/repo');

  it('returns an empty list when ignore file is missing', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(false),
    });

    await expect(Ignore(fileSystem, gitPaths)).resolves.toEqual([]);
    expect(fileSystem.read).not.toHaveBeenCalled();
  });

  it('reads non-empty and non-comment ignore rules', async () => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(true),
      read: jest
        .fn()
        .mockResolvedValue(
          Buffer.from('# comment\n\nnode_modules\n  dist  \r\n'),
        ),
    });

    await expect(Ignore(fileSystem, gitPaths)).resolves.toEqual([
      'node_modules',
      'dist',
    ]);
  });
});
