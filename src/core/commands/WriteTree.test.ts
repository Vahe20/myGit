import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { WriteTree } from './WriteTree';

describe('WriteTree', () => {
  it('should create tree object from indexService', async () => {
    const saveMock = jest.fn().mockResolvedValue('tree-hash');

    const objectStore: IObjectStore = {
      save: saveMock,
      read: jest.fn(),
      buildPath: jest.fn(),
    };

    const index: IIndexService = {
      add: jest.fn().mockReturnThis(),
      get: jest.fn(),
      has: jest.fn(),
      remove: jest.fn().mockReturnThis(),
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn(),
      getAll: jest
        .fn()
        .mockReturnValue(new Map([['src/main.ts', 'blob-hash']])),
      clear: jest.fn(),
    };
    jest.mocked(index.load).mockResolvedValue(index);

    const writeTree = new WriteTree(objectStore);

    const result = await writeTree.execute(index);

    expect(result).toBe('tree-hash');

    expect(saveMock).toHaveBeenCalledTimes(2);
  });
});
