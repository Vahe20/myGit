import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { TreeReader } from '../../services/treeReader/TreeReader';
import { WorkingTreeRestorer } from '../../services/workingTreeRestorer/WorkingTreeRestorer';
import { CommitObject } from '../objects/CommitObject';
import { IRefStore } from '../refs/IRefStore';
import { Restore } from './Restore';

const createRefStore = (overrides: Partial<IRefStore> = {}): IRefStore => ({
  getHeadRef: jest.fn(),
  setHeadRef: jest.fn(),
  getCurrentCommit: jest.fn(),
  getBranchCommit: jest.fn(),
  updateCurrentBranch: jest.fn(),
  ...overrides,
});

describe('Restore', () => {
  it('restores a single file from the current commit tree', async () => {
    const commit = new CommitObject({
      tree: 'tree-hash',
      author: 'vahe',
      message: 'init',
    });
    const refStore = createRefStore({
      getCurrentCommit: jest.fn().mockResolvedValue('commit-hash'),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      buildPath: jest.fn(),
      read: jest.fn().mockResolvedValue(commit.serialize()),
    };
    const treeReader = {
      findBlob: jest.fn().mockResolvedValue('blob-hash'),
    } as unknown as TreeReader;
    const workingTreeRestorer = {
      restoreBlob: jest.fn().mockResolvedValue(undefined),
    } as unknown as WorkingTreeRestorer;

    await new Restore(
      objectStore,
      refStore,
      workingTreeRestorer,
      treeReader,
    ).execute('src/index.ts');

    expect(objectStore.read).toHaveBeenCalledWith('commit-hash');
    expect(treeReader.findBlob).toHaveBeenCalledWith(
      'tree-hash',
      'src/index.ts',
    );
    expect(workingTreeRestorer.restoreBlob).toHaveBeenCalledWith(
      'src/index.ts',
      'blob-hash',
    );
  });

  it('throws when there is no current commit', async () => {
    const refStore = createRefStore({
      getCurrentCommit: jest.fn().mockResolvedValue(undefined),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      buildPath: jest.fn(),
      read: jest.fn(),
    };
    const treeReader = { findBlob: jest.fn() } as unknown as TreeReader;
    const workingTreeRestorer = {
      restoreBlob: jest.fn(),
    } as unknown as WorkingTreeRestorer;

    await expect(
      new Restore(
        objectStore,
        refStore,
        workingTreeRestorer,
        treeReader,
      ).execute('src/index.ts'),
    ).rejects.toThrow('commit not required');

    expect(objectStore.read).not.toHaveBeenCalled();
    expect(treeReader.findBlob).not.toHaveBeenCalled();
    expect(workingTreeRestorer.restoreBlob).not.toHaveBeenCalled();
  });
});
