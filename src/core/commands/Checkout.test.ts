import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { WorkingTreeRestorer } from '../../services/workingTreeRestorer/WorkingTreeRestorer';
import { CommitObject } from '../objects/CommitObject';
import { IRefStore } from '../refs/IRefStore';
import { Checkout } from './Checkout';

const createRefStore = (overrides: Partial<IRefStore> = {}): IRefStore => ({
  getHeadRef: jest.fn(),
  setHeadRef: jest.fn(),
  getCurrentCommit: jest.fn(),
  getBranchCommit: jest.fn(),
  updateCurrentBranch: jest.fn(),
  ...overrides,
});

describe('Checkout', () => {
  it('restores the working tree and updates HEAD', async () => {
    const commit = new CommitObject({
      tree: 'tree-hash',
      author: 'vahe',
      message: 'init',
    });
    const refStore = createRefStore({
      getBranchCommit: jest.fn().mockResolvedValue('commit-hash'),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      buildPath: jest.fn(),
      read: jest.fn().mockResolvedValue(commit.serialize()),
    };
    const workingTreeRestorer = {
      restore: jest.fn().mockResolvedValue(undefined),
    } as unknown as WorkingTreeRestorer;

    await new Checkout(refStore, objectStore, workingTreeRestorer).execute(
      'feature',
    );

    expect(refStore.getBranchCommit).toHaveBeenCalledWith('feature');
    expect(objectStore.read).toHaveBeenCalledWith('commit-hash');
    expect(workingTreeRestorer.restore).toHaveBeenCalledWith('tree-hash');
    expect(refStore.setHeadRef).toHaveBeenCalledWith('feature');
  });

  it('throws when the branch does not exist', async () => {
    const refStore = createRefStore({
      getBranchCommit: jest.fn().mockResolvedValue(undefined),
    });
    const objectStore: IObjectStore = {
      save: jest.fn(),
      buildPath: jest.fn(),
      read: jest.fn(),
    };
    const workingTreeRestorer = {
      restore: jest.fn(),
    } as unknown as WorkingTreeRestorer;

    await expect(
      new Checkout(refStore, objectStore, workingTreeRestorer).execute(
        'missing',
      ),
    ).rejects.toThrow('Branch "missing" does not exist');

    expect(objectStore.read).not.toHaveBeenCalled();
    expect(workingTreeRestorer.restore).not.toHaveBeenCalled();
    expect(refStore.setHeadRef).not.toHaveBeenCalled();
  });
});
