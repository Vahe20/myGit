import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from '../indexService/IIndexService';
import { ICommand } from './ICommand';

export class Rm implements ICommand<void, [string]> {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly indexService: IIndexService,
  ) {}

  public async execute(path: string): Promise<void> {
    const index = await this.indexService.load();

    if (!index.has(path)) {
      throw new Error(`File is not tracked: ${path}`);
    }

    index.remove(path);

    await index.save();

    await this.fileSystem.delete(path);
  }
}
