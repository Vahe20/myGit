export interface IRefStore {
  getHeadRef(): Promise<string>;
  getCurrentCommit(): Promise<string | undefined>;
  updateCurrentBranch(hash: string): Promise<void>;
}
