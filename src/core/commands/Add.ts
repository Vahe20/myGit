import { IFileSystem } from '../../utils/fs/IFileSystem';
import { FileScanner } from '../../utils/scanner/FileScanner';
import { IIndexService } from '../index/IIndexService';
import { BlobObject } from '../objects/BlobObject';
import { IObjectStore } from '../objects/IObjectStore';
import { ICommand } from './ICommand';

export class Add implements ICommand<void, [string]> {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly scanner: FileScanner,
    private readonly objectStore: IObjectStore,
    private readonly index: IIndexService,
  ) {}

  async execute(path: string): Promise<void> {
    await this.index.load();

    if (path === '.') {
      const files = await this.scanner.scan();

      for (const file of files) {
        await this.addFile(file);
      }

      await this.index.save();
      return;
    }

    await this.addFile(path);
    await this.index.save();
  }

  private async addFile(path: string): Promise<void> {
    const data = await this.fileSystem.read(path);

    const blob = new BlobObject(data).serialize();

    const hash = await this.objectStore.save(blob);

    this.index.add(path, hash);
  }
}
