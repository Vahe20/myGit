import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { TreeReader } from '../../services/treeReader/TreeReader';
import { WorkingTreeRestorer } from '../../services/workingTreeRestorer/WorkingTreeRestorer';
import { CommitObject } from '../objects/CommitObject';
import { IRefStore } from '../refs/IRefStore';
import { ICommand } from './ICommand';

export class Restore implements ICommand<void, [string]> {
  constructor(
    private readonly objectStore: IObjectStore,
    private readonly refStore: IRefStore,
    private readonly workingTreeRestorer: WorkingTreeRestorer,
    private readonly treeReader: TreeReader,
  ) {}

  public async execute(filePath: string): Promise<void> {
    const commitHash = await this.refStore.getCurrentCommit();

    if (!commitHash) {
      throw new Error(`commit not required`);
    }

    const commit = CommitObject.parse(await this.objectStore.read(commitHash));

    const blobHash = await this.treeReader.findBlob(commit.tree, filePath);

    await this.workingTreeRestorer.restoreBlob(filePath, blobHash);
  }
}
