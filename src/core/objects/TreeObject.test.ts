import { TreeEntry, TreeObject } from './TreeObject';

describe('TreeObject', () => {
  it('should serialize tree correctly', () => {
    const entries: TreeEntry[] = [
      {
        type: 'blob',
        name: 'test.txt',
        hash: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
      },
    ];

    const tree = new TreeObject(entries);

    const result = tree.serialize();

    const expectedContent = Buffer.concat([
      Buffer.from('100644 test.txt\0'),
      Buffer.from('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d', 'hex'),
    ]);

    const expected = Buffer.concat([
      Buffer.from(`tree ${expectedContent.length}\0`),
      expectedContent,
    ]);

    expect(result).toEqual(expected);
  });

  it('uses tree mode for nested tree entries', () => {
    const tree = new TreeObject([
      {
        type: 'tree',
        name: 'src',
        hash: '0123456789abcdef0123456789abcdef01234567',
      },
    ]);

    const expectedContent = Buffer.concat([
      Buffer.from('040000 src\0'),
      Buffer.from('0123456789abcdef0123456789abcdef01234567', 'hex'),
    ]);

    const expected = Buffer.concat([
      Buffer.from(`tree ${expectedContent.length}\0`),
      expectedContent,
    ]);

    expect(tree.serialize()).toEqual(expected);
  });
});
