import { TreeObject } from '../../core/objects/TreeObject';
import { IObjectStore } from '../objectStore/IObjectStore';
import { TreeReader } from './TreeReader';

const readmeHash = 'a'.repeat(40);
const srcTreeHash = 'b'.repeat(40);
const indexHash = 'c'.repeat(40);

const rootTree = new TreeObject([
  { type: 'blob', name: 'README.md', hash: readmeHash },
  { type: 'tree', name: 'src', hash: srcTreeHash },
]).serialize();

const srcTree = new TreeObject([
  { type: 'blob', name: 'index.ts', hash: indexHash },
]).serialize();

const createObjectStore = (): IObjectStore => ({
  save: jest.fn(),
  buildPath: jest.fn(),
  read: jest.fn(async (hash: string) => {
    if (hash === 'root-hash') {
      return rootTree;
    }

    if (hash === srcTreeHash) {
      return srcTree;
    }

    throw new Error(`unexpected hash: ${hash}`);
  }),
});

describe('TreeReader', () => {
  it('finds a blob at the tree root', async () => {
    const reader = new TreeReader(createObjectStore());

    await expect(reader.findBlob('root-hash', 'README.md')).resolves.toBe(
      readmeHash,
    );
  });

  it('finds a blob nested inside a subtree', async () => {
    const reader = new TreeReader(createObjectStore());

    await expect(reader.findBlob('root-hash', 'src/index.ts')).resolves.toBe(
      indexHash,
    );
  });

  it('throws when the blob does not exist', async () => {
    const reader = new TreeReader(createObjectStore());

    await expect(reader.findBlob('root-hash', 'missing.txt')).rejects.toThrow(
      'Blob not found: missing.txt',
    );
  });
});
