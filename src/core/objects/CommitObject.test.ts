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

  it('parses serialized commit data', () => {
    const commit = new CommitObject({
      tree: 'tree-hash',
      parent: 'parent-hash',
      author: 'Vahe Ghazaryan',
      message: 'line one\nline two',
    });

    expect(CommitObject.parse(commit.serialize())).toEqual({
      tree: 'tree-hash',
      parent: 'parent-hash',
      author: 'Vahe Ghazaryan',
      message: 'line one\nline two',
    });
  });

  it('throws when commit data is invalid', () => {
    expect(() => CommitObject.parse(Buffer.from('missing separator'))).toThrow(
      'Invalid commit object',
    );

    expect(() =>
      CommitObject.parse(Buffer.from('commit 12\0author Vahe\n\nmessage')),
    ).toThrow('Commit object has no tree');

    expect(() =>
      CommitObject.parse(Buffer.from('commit 12\0tree abc\n\nmessage')),
    ).toThrow('Commit object has no author');
  });
});
