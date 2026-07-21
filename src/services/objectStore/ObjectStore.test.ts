import path from 'node:path';

import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { ICompressionService } from '../../infrastructure/compression/ICompressionService';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { ObjectStore } from './ObjectStore';

const createFileSystem = (
  overrides: Partial<IFileSystem> = {},
): IFileSystem => ({
  read: jest.fn(),
  write: jest.fn(),
  exists: jest.fn(),
  createDir: jest.fn(),
  list: jest.fn(),
  stat: jest.fn(),
  ...overrides,
});

describe('ObjectStore', () => {
  const gitPaths = new RepositoryPaths('/repo');
  const hash = 'abcdef1234567890abcdef1234567890abcdef12';
  const data = Buffer.from('blob 5\0hello');
  const compressed = Buffer.from('compressed');

  const createStore = (exists = false) => {
    const fileSystem = createFileSystem({
      exists: jest.fn().mockResolvedValue(exists),
      read: jest.fn().mockResolvedValue(compressed),
    });
    const hashService: IHashService = {
      hash: jest.fn().mockResolvedValue(hash),
    };
    const compression: ICompressionService = {
      compress: jest.fn().mockResolvedValue(compressed),
      decompress: jest.fn().mockResolvedValue(data),
    };

    return {
      fileSystem,
      hashService,
      compression,
      store: new ObjectStore(fileSystem, hashService, compression, gitPaths),
    };
  };

  it('builds an object path using the first two hash characters as directory', () => {
    const { store } = createStore();

    expect(store.buildPath(hash)).toBe(
      path.join(
        gitPaths.objects(),
        'ab/cdef1234567890abcdef1234567890abcdef12',
      ),
    );
  });

  it('compresses and writes new objects', async () => {
    const { store, fileSystem, compression } = createStore(false);

    await expect(store.save(data)).resolves.toBe(hash);

    expect(compression.compress).toHaveBeenCalledWith(data);
    expect(fileSystem.write).toHaveBeenCalledWith(
      store.buildPath(hash),
      compressed,
    );
  });

  it('does not rewrite objects that already exist', async () => {
    const { store, fileSystem, compression } = createStore(true);

    await expect(store.save(data)).resolves.toBe(hash);

    expect(compression.compress).not.toHaveBeenCalled();
    expect(fileSystem.write).not.toHaveBeenCalled();
  });

  it('reads and decompresses stored objects', async () => {
    const { store, fileSystem, compression } = createStore();

    await expect(store.read(hash)).resolves.toEqual(data);

    expect(fileSystem.read).toHaveBeenCalledWith(store.buildPath(hash));
    expect(compression.decompress).toHaveBeenCalledWith(compressed);
  });
});
