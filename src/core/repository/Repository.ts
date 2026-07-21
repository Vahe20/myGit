import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';

export class Repository {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly gitPaths: RepositoryPaths,
  ) {}

  async init(): Promise<void> {
    const myGitPath = this.gitPaths.myGit();
    const objectPath = this.gitPaths.objects();
    const refsPath = this.gitPaths.refs();
    const headPath = this.gitPaths.head();
    const indexPath = this.gitPaths.index();

    await this.fileSystem.createDir(myGitPath);
    await this.fileSystem.createDir(objectPath);
    await this.fileSystem.createDir(refsPath);
    if (!(await this.fileSystem.exists(headPath))) {
      await this.fileSystem.write(
        headPath,
        Buffer.from('ref: refs/heads/main\n'),
      );
    }
    if (!(await this.fileSystem.exists(indexPath))) {
      await this.fileSystem.write(indexPath, Buffer.from(''));
    }
  }
}
