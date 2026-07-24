import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { ILogger } from '../../utils/logger/ILogger';
import { BlobObject } from '../objects/BlobObject';
import { CommitObject } from '../objects/CommitObject';
import { TreeObject } from '../objects/TreeObject';
import { CatFile } from './CatFile';

const createLogger = (): ILogger => ({
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

const createObjectStore = (data: Buffer): IObjectStore => ({
  save: jest.fn(),
  buildPath: jest.fn(),
  read: jest.fn().mockResolvedValue(data),
});

describe('CatFile', () => {
  it('logs blob content', async () => {
    const data = new BlobObject(Buffer.from('hello')).serialize();
    const objectStore = createObjectStore(data);
    const logger = createLogger();

    await new CatFile(objectStore, logger).execute('blob-hash');

    expect(objectStore.read).toHaveBeenCalledWith('blob-hash');
    expect(logger.info).toHaveBeenCalledWith('hello');
  });

  it('logs parsed tree entries', async () => {
    const entries = [
      {
        type: 'blob' as const,
        name: 'test.txt',
        hash: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
      },
    ];
    const data = new TreeObject(entries).serialize();
    const objectStore = createObjectStore(data);
    const logger = createLogger();

    await new CatFile(objectStore, logger).execute('tree-hash');

    expect(logger.info).toHaveBeenCalledWith(entries);
  });

  it('logs parsed commit data', async () => {
    const commitData = {
      tree: 'tree-hash',
      author: 'vahe',
      message: 'init',
    };
    const data = new CommitObject(commitData).serialize();
    const objectStore = createObjectStore(data);
    const logger = createLogger();

    await new CatFile(objectStore, logger).execute('commit-hash');

    expect(logger.info).toHaveBeenCalledWith(commitData);
  });

  it('does nothing for an unknown object type', async () => {
    const data = Buffer.from('unknown 0\0');
    const objectStore = createObjectStore(data);
    const logger = createLogger();

    await new CatFile(objectStore, logger).execute('some-hash');

    expect(logger.info).not.toHaveBeenCalled();
  });
});
