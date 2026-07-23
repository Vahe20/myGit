import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IRefStore } from '../refs/IRefStore';
import { ICommand } from './ICommand';

export class Branch implements ICommand<void, [string]> {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly repositoryPaths: RepositoryPaths,
    private readonly refStore: IRefStore,
  ) {}

  public async execute(name: string): Promise<void> {
    const currentCommit = await this.refStore.getCurrentCommit();

    if (!currentCommit) {
      throw new Error('No commits yet');
    }

    const branchPath = this.repositoryPaths.branch(name);

    if (await this.fileSystem.exists(branchPath)) {
      throw new Error('Branch already exists');
    }

    await this.fileSystem.write(branchPath, Buffer.from(currentCommit));
  }
}
