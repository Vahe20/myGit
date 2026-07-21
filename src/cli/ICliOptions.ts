export interface ICliOptions {
  command?: string;
  args: string[];
  options: Record<string, string | boolean>;
}
