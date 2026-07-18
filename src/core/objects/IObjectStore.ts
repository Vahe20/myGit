export interface IObjectStore {
  save(data: Buffer): Promise<string>;
  read(hash: string): Promise<Buffer>;
  buildPath(hash: string): string;
}
