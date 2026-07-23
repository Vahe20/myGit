import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { IFileScanner } from '../../services/fileScanner/IFileScanner';
import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { BlobObject } from '../objects/BlobObject';
import { CommitObject } from '../objects/CommitObject';
import { TreeObject } from '../objects/TreeObject';
import { IRefStore } from '../refs/IRefStore';

export class Status {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly scanner: IFileScanner,
    private readonly index: IIndexService,
    private readonly hashService: IHashService,
    private readonly objectStore: IObjectStore,
    private readonly refStore: IRefStore,
  ) {}

  async execute() {
    const index = (await this.index.load()).getAll();

    const head = await this.loadHeadFiles();

    const working = await this.loadWorkingFiles();

    return {
      staged: this.getStaged(head, index),
      modified: this.getModified(index, working),
      deleted: this.getDeleted(index, working),
      untracked: this.getUntracked(index, working),
    };
  }

  private async loadHeadFiles(): Promise<Map<string, string>> {
    const commitHash = await this.refStore.getCurrentCommit();

    if (!commitHash) {
      return new Map();
    }

    const data = await this.objectStore.read(commitHash);

    const commit = CommitObject.parse(data);
    return await this.loadTree(commit.tree);
  }

  private async loadTree(
    treeHash: string,
    prefix = '',
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();

    const data = await this.objectStore.read(treeHash);
    const entries = TreeObject.parse(data);

    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.type === 'blob') {
        result.set(path, entry.hash);
      } else {
        const children = await this.loadTree(entry.hash, path);

        for (const [childPath, hash] of children) {
          result.set(childPath, hash);
        }
      }
    }

    return result;
  }

  private async loadWorkingFiles(): Promise<Map<string, string>> {
    const files = await this.scanner.scan();

    const result = new Map<string, string>();

    for (const filePath of files) {
      const data = await this.fileSystem.read(filePath);

      const blob = new BlobObject(data).serialize();

      const hash = await this.hashService.hash(blob);

      result.set(filePath, hash);
    }

    return result;
  }

  private getModified(
    index: Map<string, string>,
    working: Map<string, string>,
  ) {
    const result = [];

    for (const [path, hash] of working) {
      if (index.has(path) && index.get(path) !== hash) {
        result.push({
          path,
          hash,
        });
      }
    }

    return result;
  }

  private getUntracked(
    index: Map<string, string>,
    working: Map<string, string>,
  ) {
    const result = [];

    for (const [path, hash] of working) {
      if (!index.has(path)) {
        result.push({
          path,
          hash,
        });
      }
    }

    return result;
  }

  private getStaged(head: Map<string, string>, index: Map<string, string>) {
    const result = [];

    for (const [path, hash] of index) {
      if (head.get(path) !== hash) {
        result.push({
          path,
          hash,
        });
      }
    }

    return result;
  }

  private getDeleted(index: Map<string, string>, working: Map<string, string>) {
    const result = [];

    for (const [path, hash] of index) {
      if (!working.has(path)) {
        result.push({
          path,
          hash,
        });
      }
    }

    return result;
  }
}
