export interface IIndex {
  add(filePath: string, hash: string): IIndex;

  get(filePath: string): string | undefined;

  remove(filePath: string): IIndex;

  getAll(): Map<string, string>;

  save(): Promise<IIndex>;

  load(): Promise<IIndex>;
}
