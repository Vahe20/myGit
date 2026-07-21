export interface IIndexService {
  add(filePath: string, hash: string): IIndexService;

  get(filePath: string): string | undefined;

  remove(filePath: string): IIndexService;

  getAll(): Map<string, string>;

  save(): Promise<IIndexService>;

  load(): Promise<IIndexService>;
}
