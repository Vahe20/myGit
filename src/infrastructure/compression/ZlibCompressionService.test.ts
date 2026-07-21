import { ZlibCompressionService } from './ZlibCompressionService';

describe('ZlibCompressionService', () => {
  it('compresses and decompresses data back to the original buffer', async () => {
    const service = new ZlibCompressionService();
    const data = Buffer.from('blob 11\0hello world');

    const compressed = await service.compress(data);
    const decompressed = await service.decompress(compressed);

    expect(compressed.equals(data)).toBe(false);
    expect(decompressed).toEqual(data);
  });
});
