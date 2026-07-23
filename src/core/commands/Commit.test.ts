import { IndexService } from '../../services/indexService/IndexService';
import { Commit } from './Commit';
import { CommitTree } from './CommitTree';
import { WriteTree } from './WriteTree';

describe('Commit', () => {
  it('writes a tree and commits it with the provided message', async () => {
    const writeTree = {
      execute: jest.fn().mockResolvedValue('tree-hash'),
    } as unknown as WriteTree;
    const commitTree = {
      execute: jest.fn().mockResolvedValue('commit-hash'),
    } as unknown as CommitTree;
    const index = {} as IndexService;

    await expect(
      new Commit(writeTree, commitTree, index).execute('initial commit'),
    ).resolves.toBe('commit-hash');

    expect(writeTree.execute).toHaveBeenCalledWith(index);
    expect(commitTree.execute).toHaveBeenCalledWith(
      'tree-hash',
      'initial commit',
    );
  });
});
