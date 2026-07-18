import IIndex from '../index/IIndex';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { BlobObject } from '../objects/BlobObject';
import { IObjectStore } from '../objects/IObjectStore';

export class GitAdd {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly objectStore: IObjectStore,
    private readonly index: IIndex,
  ) {}

  async execute(filePath: string): Promise<void> {
    await this.index.load();
    const data = await this.fileSystem.read(filePath);

    const blob = new BlobObject(data).serialize();

    const hash = await this.objectStore.save(blob);

    await this.index.add(filePath, hash).save();
  }
}
