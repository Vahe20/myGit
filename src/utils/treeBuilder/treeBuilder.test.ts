import { IIndexService } from '../../core/index/IIndexService';
import { TreeBuilder } from './treeBuilder';

const createIndex = (entries: [string, string][]): IIndexService => {
  const index: IIndexService = {
    add: jest.fn().mockReturnThis(),
    get: jest.fn(),
    remove: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map(entries)),
  };

  jest.mocked(index.load).mockResolvedValue(index);

  return index;
};

describe('TreeBuilder', () => {
  it('builds a nested tree from index paths', async () => {
    const root = await new TreeBuilder().build(
      createIndex([
        ['src/main.ts', 'hash-main'],
        ['README.md', 'hash-readme'],
      ]),
    );

    expect(root.children.get('README.md')?.type).toBe('blob');
    expect(root.children.get('README.md')?.hash).toBe('hash-readme');

    const src = root.children.get('src');
    expect(src?.type).toBe('tree');
    expect(src?.children.get('main.ts')?.type).toBe('blob');
    expect(src?.children.get('main.ts')?.hash).toBe('hash-main');
  });

  it('throws when a path tries to use a blob as a tree', async () => {
    await expect(
      new TreeBuilder().build(
        createIndex([
          ['src', 'hash-src-file'],
          ['src/main.ts', 'hash-main'],
        ]),
      ),
    ).rejects.toThrow('"src/main.ts": "src" is a blob, expected a tree.');
  });
});
