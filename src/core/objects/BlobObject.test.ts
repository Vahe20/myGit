import { BlobObject } from './BlobObject';

describe('Blob', () => {
  it('serializes correctly', () => {
    const blob = new BlobObject(Buffer.from('hello'));
    const blob2 = new BlobObject(Buffer.from('test test'));

    expect(blob.serialize().toString()).toBe('blob 5\0hello');
    expect(blob2.serialize().toString()).toBe('blob 9\0test test');
  });
});
