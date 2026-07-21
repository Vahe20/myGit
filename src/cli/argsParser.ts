import { ICliOptions } from './ICliOptions';

export const argsParser = (args: string[]): ICliOptions => {
  const [command, ...rest] = args;

  const options: Record<string, string | boolean> = {};
  const positionalArgs: string[] = [];

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];

    if (arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '');

      const next = rest[i + 1];

      if (next && !next.startsWith('-')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positionalArgs.push(arg);
    }
  }

  return {
    command,
    args: positionalArgs,
    options,
  };
};
