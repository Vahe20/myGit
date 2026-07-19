import { IGitObject } from './IGitObject';

export interface CommitData {
  tree: string;
  parent?: string;
  author: string;
  message: string;
}

export class CommitObject implements IGitObject {
  constructor(private readonly data: CommitData) {}

  public serialize(): Buffer {
    const content = [
      `tree ${this.data.tree}`,
      this.data.parent ? `parent ${this.data.parent}` : '',
      `author ${this.data.author}`,
      '',
      this.data.message,
    ]
      .filter(Boolean)
      .join('\n');

    const body = Buffer.from(content);

    const header = Buffer.from(`commit ${body.length}\0`);

    return Buffer.concat([header, body]);
  }
}
