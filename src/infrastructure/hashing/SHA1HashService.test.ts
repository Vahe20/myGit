import { SHA1HashService } from './SHA1HashService';

describe('SHA1HashService', () => {
  const service = new SHA1HashService();

  it('should hash empty buffer', async () => {
    const hash = await service.hash(Buffer.from(''));

    expect(hash).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('should create correct sha1 hash', async () => {
    const hash = await service.hash(Buffer.from('hello'));

    expect(hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });
});
