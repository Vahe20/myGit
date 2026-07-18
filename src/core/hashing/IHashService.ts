export interface IHashService {
  hash(data: Buffer): Promise<string>;
}
