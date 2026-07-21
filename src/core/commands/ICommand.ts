export interface ICommand<Result = void, Args extends unknown[] = []> {
  execute(...args: Args): Promise<Result>;
}
