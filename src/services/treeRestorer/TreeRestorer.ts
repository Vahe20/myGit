import path from 'node:path';

import { BlobObject } from '../../core/objects/BlobObject';
import { TreeObject } from '../../core/objects/TreeObject';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from '../indexService/IIndexService';
import { IObjectStore } from '../objectStore/IObjectStore';

export class TreeRestorer {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly objectStore: IObjectStore,
    private readonly indexService: IIndexService,
  ) {}

  public async restore(treeHash: string): Promise<void> {
    this.indexService.clear();

    await this.restoreTree(treeHash, '');

    await this.indexService.save();
  }

  private async restoreTree(
    treeHash: string,
    currentPath: string,
  ): Promise<void> {
    const treeBuffer = await this.objectStore.read(treeHash);
    const entries = TreeObject.parse(treeBuffer);

    for (const entry of entries) {
      const filePath = path.join(currentPath, entry.name);

      if (entry.type === 'tree') {
        await this.restoreTree(entry.hash, filePath);
        continue;
      }

      const blobBuffer = await this.objectStore.read(entry.hash);
      const content = BlobObject.parse(blobBuffer);

      await this.fileSystem.write(filePath, Buffer.from(content));

      this.indexService.add(filePath, entry.hash);
    }
  }
}
