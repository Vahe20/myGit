import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { CommitObject } from '../objects/CommitObject';
import { RefStore } from '../refs/RefStore';
import { ICommand } from './ICommand';

export class CommitTree implements ICommand<string, [string, string]> {
  constructor(
    private readonly objectStore: IObjectStore,
    private readonly refStore: RefStore,
  ) {}

  async execute(treeHash: string, message: string): Promise<string> {
    const parent = await this.refStore.getCurrentCommit();

    const commitObject = new CommitObject({
      tree: treeHash,
      parent,
      author: 'vahe',
      message,
    });

    const hash = await this.objectStore.save(commitObject.serialize());

    await this.refStore.updateCurrentBranch(hash);

    return hash;
  }
}
