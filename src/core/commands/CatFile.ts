import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { ILogger } from '../../utils/logger/ILogger';
import { BlobObject } from '../objects/BlobObject';
import { CommitObject } from '../objects/CommitObject';
import { TreeObject } from '../objects/TreeObject';
import { ICommand } from './ICommand';

export class CatFile implements ICommand<void, [string]> {
  constructor(
    private readonly objectStore: IObjectStore,
    private readonly logger: ILogger,
  ) {}

  public async execute(hash: string): Promise<void> {
    const buffer = await this.objectStore.read(hash);

    const separator = buffer.indexOf(0);

    const header = buffer.subarray(0, separator).toString();

    const [type] = header.split(' ');

    switch (type) {
      case 'blob': {
        const blob = BlobObject.parse(buffer);
        this.logger.info(blob);
        break;
      }
      case 'tree': {
        const tree = TreeObject.parse(buffer);
        this.logger.info(tree);
        break;
      }
      case 'commit': {
        const commit = CommitObject.parse(buffer);
        this.logger.info(commit);
        break;
      }
      default: {
        break;
      }
    }
  }
}
