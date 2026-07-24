import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IFileScanner } from '../../services/fileScanner/IFileScanner';
import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { BlobObject } from '../objects/BlobObject';
import { ICommand } from './ICommand';

export class Add implements ICommand<void, [string]> {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly scanner: IFileScanner,
    private readonly objectStore: IObjectStore,
    private readonly indexService: IIndexService,
  ) {}

  async execute(path: string): Promise<void> {
    await this.indexService.load();

    if (path === '.') {
      const files = await this.scanner.scan();

      for (const file of files) {
        await this.addFile(file);
      }

      await this.indexService.save();
      return;
    }

    await this.addFile(path);
    await this.indexService.save();
  }

  private async addFile(path: string): Promise<void> {
    const data = await this.fileSystem.read(path);

    const blob = new BlobObject(data).serialize();

    const hash = await this.objectStore.save(blob);

    this.indexService.add(path, hash);
  }
}
