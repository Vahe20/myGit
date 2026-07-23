import { IndexService } from '../../services/indexService/IndexService';
import { CommitTree } from './CommitTree';
import { ICommand } from './ICommand';
import { WriteTree } from './WriteTree';

export class Commit implements ICommand<string, [string]> {
  constructor(
    private readonly writeTree: WriteTree,
    private readonly commitTree: CommitTree,
    private readonly index: IndexService,
  ) {}

  async execute(message: string): Promise<string> {
    const treeHash = await this.writeTree.execute(this.index);

    return this.commitTree.execute(treeHash, message);
  }
}
