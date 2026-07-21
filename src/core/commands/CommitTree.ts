import { GitPaths } from '../../configs/GitPaths';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { CommitObject } from '../objects/CommitObject';
import { IObjectStore } from '../objects/IObjectStore';
import { ICommand } from './ICommand';

export class CommitTree implements ICommand<string, [string, string]> {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly objectStore: IObjectStore,
    private readonly gitPaths: GitPaths,
  ) {}

  async execute(treeHash: string, message: string) {
    const head = (await this.fileSystem.read(this.gitPaths.head()))
      .toString()
      .trim();

    if (!head.startsWith('ref:')) {
      throw new Error('Detached HEAD not supported');
    }

    const ref = head.split(' ')[1];

    const branchPath = this.gitPaths.myGit() + '/' + ref;

    let parent: string | undefined;

    if (await this.fileSystem.exists(branchPath)) {
      parent = (await this.fileSystem.read(branchPath)).toString().trim();
    }

    const commitObject = new CommitObject({
      tree: treeHash,
      parent,
      author: 'vahe',
      message,
    });

    const hash = await this.objectStore.save(commitObject.serialize());

    await this.fileSystem.write(branchPath, Buffer.from(hash));

    return hash;
  }
}
