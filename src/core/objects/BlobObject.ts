export class BlobObject {
  constructor(private readonly content: Buffer) {}

  serialize(): Buffer {
    const header = `blob ${this.content.length}\0`;

    return Buffer.concat([Buffer.from(header), this.content]);
  }
}
