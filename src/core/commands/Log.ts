import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { Logger } from '../../utils/logger/Logger';
import { CommitObject } from '../objects/CommitObject';
import { IRefStore } from '../refs/IRefStore';
import { ICommand } from './ICommand';

export class Log implements ICommand {
  constructor(
    private readonly objectStore: IObjectStore,
    private readonly refStore: IRefStore,
    private readonly logger: Logger,
  ) {}

  public async execute(): Promise<void> {
    let commitHash = await this.refStore.getCurrentCommit();

    while (commitHash) {
      const data = await this.objectStore.read(commitHash);

      const commit = CommitObject.parse(data);

      this.logger.warn('commit:', commitHash);
      this.logger.info('Author:', commit.author);
      if (commit.parent) {
        this.logger.info('parent:', commit.parent);
      }
      console.log();
      this.logger.info('\t' + commit.message);
      console.log();

      commitHash = commit.parent;
    }
  }
}
