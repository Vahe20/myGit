import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';

export class RefStore {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly gitPaths: RepositoryPaths,
  ) {}
  async getHeadRef(): Promise<string> {
    const head = (await this.fileSystem.read(this.gitPaths.head()))
      .toString()
      .trim();

    if (!head.startsWith('ref:')) {
      throw new Error('Detached HEAD not supported');
    }

    return head.split(' ')[1];
  }
  async getCurrentCommit(): Promise<string | undefined> {
    const ref = await this.getHeadRef();

    const branchPath = this.gitPaths.ref(ref);

    if (!(await this.fileSystem.exists(branchPath))) {
      return undefined;
    }

    return (await this.fileSystem.read(branchPath)).toString().trim();
  }
  async updateCurrentBranch(hash: string): Promise<void> {
    const ref = await this.getHeadRef();

    const branchPath = this.gitPaths.ref(ref);

    await this.fileSystem.write(branchPath, Buffer.from(hash));
  }
}
