import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { Logger } from '../../utils/logger/Logger';
import { CommitObject } from '../objects/CommitObject';
import { IObjectStore } from '../objects/IObjectStore';
import { ICommand } from './ICommand';

export class Log implements ICommand {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly objectStore: IObjectStore,
    private readonly gitPaths: GitPaths,
    private readonly logger: Logger,
  ) {}

  public async execute(): Promise<void> {
    const head = (await this.fileSystem.read(this.gitPaths.head()))
      .toString()
      .trim();

    if (!head.startsWith('ref:')) {
      throw new Error('Detached HEAD not supported');
    }

    const ref = head.split(' ')[1];

    const branchPath = this.gitPaths.myGit() + '/' + ref;

    if (!(await this.fileSystem.exists(branchPath))) {
      return;
    }

    let commitHash = (await this.fileSystem.read(branchPath)).toString().trim();

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

      commitHash = commit.parent ?? '';
    }
  }
}
