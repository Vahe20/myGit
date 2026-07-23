import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IRefStore } from './IRefStore';

export class RefStore implements IRefStore {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly repositoryPaths: RepositoryPaths,
  ) {}
  async getHeadRef(): Promise<string> {
    const head = (await this.fileSystem.read(this.repositoryPaths.head()))
      .toString()
      .trim();

    if (!head.startsWith('ref:')) {
      throw new Error('Detached HEAD not supported');
    }

    return head.split(' ')[1];
  }

  async setHeadRef(branch: string): Promise<void> {
    const ref = `ref: refs/heads/${branch}\n`;
    await this.fileSystem.write(this.repositoryPaths.head(), Buffer.from(ref));
  }

  async getCurrentCommit(): Promise<string | undefined> {
    const ref = await this.getHeadRef();

    const branchPath = this.repositoryPaths.ref(ref);

    if (!(await this.fileSystem.exists(branchPath))) {
      return undefined;
    }

    return (await this.fileSystem.read(branchPath)).toString().trim();
  }

  async getBranchCommit(branch: string): Promise<string | undefined> {
    const branchPath = this.repositoryPaths.branch(branch);

    if (!(await this.fileSystem.exists(branchPath))) {
      return undefined;
    }

    return (await this.fileSystem.read(branchPath)).toString().trim();
  }

  async updateCurrentBranch(hash: string): Promise<void> {
    const ref = await this.getHeadRef();

    const branchPath = this.repositoryPaths.ref(ref);

    await this.fileSystem.write(branchPath, Buffer.from(hash));
  }
}
