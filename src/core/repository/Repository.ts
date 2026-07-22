import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';

export class Repository {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly repositoryPaths: RepositoryPaths,
  ) {}

  async init(): Promise<void> {
    const myGitPath = this.repositoryPaths.myGit();
    const objectPath = this.repositoryPaths.objects();
    const refsPath = this.repositoryPaths.refs();
    const headPath = this.repositoryPaths.head();
    const indexPath = this.repositoryPaths.index();

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
