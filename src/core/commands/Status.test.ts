import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { CommitObject } from '../objects/CommitObject';
import { TreeObject } from '../objects/TreeObject';
import { RefStore } from '../refs/RefStore';
import { Status } from './Status';

const createIndex = (entries: [string, string][]): IIndexService => {
  const indexService: IIndexService = {
    add: jest.fn().mockReturnThis(),
    get: jest.fn(),
    has: jest.fn(),
    remove: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map(entries)),
    clear: jest.fn(),
  };

  jest.mocked(indexService.load).mockResolvedValue(indexService);

  return indexService;
};

describe('Status', () => {
  it('reports modified, untracked, and staged files', async () => {
    const fileSystem: IFileSystem = {
      read: jest.fn(async (filePath: string) => Buffer.from(filePath)),
      write: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      createDir: jest.fn(),
      list: jest.fn(),
      stat: jest.fn(),
    };

    const scanner = {
      scan: jest.fn().mockResolvedValue(['tracked.txt', 'new.txt']),
    };

    const index = createIndex([
      ['tracked.txt', 'old-hash'],
      ['staged-only.txt', 'staged-hash'],
    ]);

    const hashService: IHashService = {
      hash: jest
        .fn()
        .mockResolvedValueOnce('new-tracked-hash')
        .mockResolvedValueOnce('new-file-hash'),
    };

    const refStore = {
      getCurrentCommit: jest.fn().mockResolvedValue('commit-hash'),
    } as unknown as RefStore;

    const tree = new TreeObject([
      {
        type: 'blob',
        name: 'tracked.txt',
        hash: 'head-hash',
      },
    ]);

    const commit = new CommitObject({
      tree: 'tree-hash',
      author: 'Test User',
      message: 'test commit',
    });

    const objectStore: IObjectStore = {
      save: jest.fn(),
      buildPath: jest.fn(),
      read: jest
        .fn()
        .mockResolvedValueOnce(commit.serialize())
        .mockResolvedValueOnce(tree.serialize()),
    };

    await expect(
      new Status(
        fileSystem,
        scanner,
        index,
        hashService,
        objectStore,
        refStore,
      ).execute(),
    ).resolves.toEqual({
      modified: [
        {
          path: 'tracked.txt',
          hash: 'new-tracked-hash',
        },
      ],

      untracked: [
        {
          path: 'new.txt',
          hash: 'new-file-hash',
        },
      ],

      staged: [
        {
          path: 'tracked.txt',
          hash: 'old-hash',
        },
        {
          path: 'staged-only.txt',
          hash: 'staged-hash',
        },
      ],

      deleted: [
        {
          path: 'staged-only.txt',
          hash: 'staged-hash',
        },
      ],
    });
  });
});
