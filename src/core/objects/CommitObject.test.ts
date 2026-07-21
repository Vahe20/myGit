import { CommitData, CommitObject } from './CommitObject';

describe('CommitObject', () => {
  it('serializes correctly', () => {
    const commitData: CommitData = {
      tree: 'abcde',
      author: 'Vahe Ghazaryan',
      message: 'init test',
    };

    const commitData2: CommitData = {
      tree: 'efeaijfaiojef',
      parent: 'abcde',
      author: 'Vahe Ghazaryan',
      message: 'test number 2',
    };

    const commit = new CommitObject(commitData);
    const commit2 = new CommitObject(commitData2);

    expect(commit.serialize().toString()).toBe(
      'commit 43\0tree abcde\n' +
        'author Vahe Ghazaryan\n' +
        '\n' +
        'init test',
    );

    expect(commit2.serialize().toString()).toBe(
      'commit 68\0tree efeaijfaiojef\n' +
        'parent abcde\n' +
        'author Vahe Ghazaryan\n' +
        '\n' +
        'test number 2',
    );
  });
});
