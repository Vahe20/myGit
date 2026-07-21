import { IGitObject } from './IGitObject';

export interface TreeEntry {
  type: 'blob' | 'tree';
  name: string;
  hash: string;
}

export class TreeObject implements IGitObject {
  constructor(private readonly entries: TreeEntry[]) {}

  public serialize(): Buffer {
    const content = Buffer.concat(
      this.entries.map((entry) =>
        Buffer.concat([
          Buffer.from(`${this.getMode(entry.type)} ${entry.name}\0`),
          Buffer.from(entry.hash, 'hex'),
        ]),
      ),
    );

    const header = Buffer.from(`tree ${content.length}\0`);

    return Buffer.concat([header, content]);
  }

  private getMode(type: TreeEntry['type']): string {
    return type === 'tree' ? '040000' : '100644';
  }
}
