import path from 'node:path';

import { BlobObject } from '../../core/objects/BlobObject';
import { TreeObject } from '../../core/objects/TreeObject';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from '../indexService/IIndexService';
import { IObjectStore } from '../objectStore/IObjectStore';
import { WorkingTreeRestorer } from './WorkingTreeRestorer';

const srcTreeHash = 'b'.repeat(40);
const readmeBlobHash = 'c'.repeat(40);
const indexBlobHash = 'd'.repeat(40);

const rootTree = new TreeObject([
  { type: 'blob', name: 'README.md', hash: readmeBlobHash },
  { type: 'tree', name: 'src', hash: srcTreeHash },
]).serialize();

const srcTree = new TreeObject([
  { type: 'blob', name: 'index.ts', hash: indexBlobHash },
]).serialize();

const readmeBlob = new BlobObject(Buffer.from('readme content')).serialize();
const indexBlob = new BlobObject(Buffer.from('index content')).serialize();

const createFileSystem = (
  overrides: Partial<IFileSystem> = {},
): IFileSystem => ({
  read: jest.fn(),
  write: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
  ...overrides,
});

const createObjectStore = (): IObjectStore => ({
  save: jest.fn(),
  buildPath: jest.fn(),
  read: jest.fn(async (hash: string) => {
    switch (hash) {
      case 'root-hash':
        return rootTree;
      case srcTreeHash:
        return srcTree;
      case readmeBlobHash:
        return readmeBlob;
      case indexBlobHash:
        return indexBlob;
      default:
        throw new Error(`unexpected hash: ${hash}`);
    }
  }),
});

const createIndex = (): IIndexService => ({
  add: jest.fn().mockReturnThis(),
  get: jest.fn(),
  has: jest.fn(),
  remove: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(undefined),
  load: jest.fn(),
  getAll: jest.fn().mockReturnValue(new Map()),
  clear: jest.fn(),
});

describe('WorkingTreeRestorer', () => {
  describe('restore', () => {
    it('clears the indexService and writes every file in the tree', async () => {
      const fileSystem = createFileSystem();
      const objectStore = createObjectStore();
      const indexService = createIndex();

      const restorer = new WorkingTreeRestorer(
        fileSystem,
        objectStore,
        indexService,
      );

      await restorer.restore('root-hash');

      expect(indexService.clear).toHaveBeenCalledTimes(1);

      expect(fileSystem.write).toHaveBeenCalledWith(
        'README.md',
        Buffer.from('readme content'),
      );
      expect(fileSystem.write).toHaveBeenCalledWith(
        path.join('src', 'index.ts'),
        Buffer.from('index content'),
      );

      expect(indexService.add).toHaveBeenCalledWith(
        'README.md',
        readmeBlobHash,
      );
      expect(indexService.add).toHaveBeenCalledWith(
        path.join('src', 'index.ts'),
        indexBlobHash,
      );

      expect(indexService.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreBlob', () => {
    it('decodes and writes a single blob to the working tree', async () => {
      const fileSystem = createFileSystem();
      const objectStore = createObjectStore();
      const indexService = createIndex();

      const restorer = new WorkingTreeRestorer(
        fileSystem,
        objectStore,
        indexService,
      );

      await restorer.restoreBlob('README.md', readmeBlobHash);

      expect(objectStore.read).toHaveBeenCalledWith(readmeBlobHash);
      expect(fileSystem.write).toHaveBeenCalledWith(
        'README.md',
        Buffer.from('readme content'),
      );
    });
  });
});
