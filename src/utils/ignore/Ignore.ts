import { IFileSystem } from '../fs/IFileSystem';
import { GitPaths } from '../../configs/GitPaths';

export const Ignore = async (
  fileSystem: IFileSystem,
  gitPaths: GitPaths,
): Promise<string[]> => {
  if (!(await fileSystem.exists(gitPaths.ignore()))) {
    return [];
  }

  const data = (await fileSystem.read(gitPaths.ignore())).toString();

  return data
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
};
