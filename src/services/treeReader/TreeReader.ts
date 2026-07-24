import path from 'node:path';

import { TreeObject } from '../../core/objects/TreeObject';
import { PathNormalizer } from '../../utils/normalizer/PathNormalizer';
import { IObjectStore } from '../objectStore/IObjectStore';

export class TreeReader {
  constructor(private readonly objectStore: IObjectStore) {}

  public async findBlob(
    rootTreeHash: string,
    filePath: string,
  ): Promise<string> {
    const hash = await this.find(rootTreeHash, filePath, '');

    if (!hash) {
      throw new Error(`Blob not found: ${filePath}`);
    }

    return hash;
  }

  private async find(
    treeHash: string,
    filePath: string,
    currentPath: string,
  ): Promise<string | undefined> {
    const treeBuffer = await this.objectStore.read(treeHash);
    const entries = TreeObject.parse(treeBuffer);
    filePath = PathNormalizer(filePath);

    for (const entry of entries) {
      const objectPath = PathNormalizer(path.join(currentPath, entry.name));

      if (entry.type === 'tree') {
        const result = await this.find(entry.hash, filePath, objectPath);

        if (result) {
          return result;
        }

        continue;
      }

      if (objectPath === filePath) {
        return entry.hash;
      }
    }

    return undefined;
  }
}
