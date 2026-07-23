import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { TreeRestorer } from '../../services/treeRestorer/TreeRestorer';
import { CommitObject } from '../objects/CommitObject';
import { IRefStore } from '../refs/IRefStore';
import { ICommand } from './ICommand';

export class Checkout implements ICommand<void, [string]> {
  constructor(
    private readonly refStore: IRefStore,
    private readonly objectStore: IObjectStore,
    private readonly treeRestorer: TreeRestorer,
  ) {}

  public async execute(branch: string): Promise<void> {
    const commitHash = await this.refStore.getBranchCommit(branch);

    if (!commitHash) {
      throw new Error(`Branch "${branch}" does not exist`);
    }

    const buffer = await this.objectStore.read(commitHash);

    const treeHash = CommitObject.parse(buffer).tree;

    await this.treeRestorer.restore(treeHash);

    await this.refStore.setHeadRef(branch);
  }
}
