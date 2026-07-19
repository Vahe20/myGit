import { CommitObject } from '../objects/CommitObject';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { IObjectStore } from '../objects/IObjectStore';
import { GitPaths } from '../../configs/GitPaths';

export class CommitTree {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly objectStore: IObjectStore,
    private readonly gitPath: GitPaths,
  ) {}

  async execute(treeHash: string, message: string) {
    const head = (await this.fileSystem.read(this.gitPath.head()))
      .toString()
      .trim();

    if (!head.startsWith('ref:')) {
      throw new Error('Detached HEAD not supported');
    }

    const ref = head.split(' ')[1];

    const branchPath = this.gitPath.myGit() + ref;

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
