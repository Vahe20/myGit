import { createContainer } from '../container/createContainer';
import { statusLog } from '../utils/logger/statusLog';
import { PathNormalizer } from '../utils/normalizer/PathNormalizer';
import { argsParser } from './argsParser';

const main = async () => {
  const cli = argsParser(process.argv.slice(2));

  const { services, commands } = createContainer();

  if (!cli.command) {
    services.logger.error('No command specified');
    return;
  }

  switch (cli.command) {
    case 'init': {
      await commands.init.execute();
      break;
    }

    case 'add': {
      const rawPath = cli.args[0];

      if (!rawPath) {
        throw new Error('File path is required');
      }

      await commands.add.execute(PathNormalizer(rawPath));

      break;
    }

    case 'rm': {
      const rawPath = cli.args[0];

      if (!rawPath) {
        throw new Error('File path is required');
      }

      await commands.rm.execute(PathNormalizer(rawPath));

      break;
    }

    case 'status': {
      const status = await commands.status.execute();

      statusLog(services.logger, status);
      break;
    }

    case 'write-tree': {
      const hash = await commands['write-tree'].execute(services.index);
      services.logger.info('tree hash: ' + hash);
      break;
    }

    case 'commit-tree': {
      const message = cli.options.m;
      const hash = cli.args[0];
      if (typeof message !== 'string') {
        throw new Error('message is require');
      }
      if (!hash) {
        throw new Error('Tree hash is require');
      }
      await commands['commit-tree'].execute(hash, message);
      break;
    }

    case 'commit': {
      const message = cli.options.m;
      if (typeof message !== 'string') {
        throw new Error('message is require');
      }
      await commands.commit.execute(message);
      break;
    }

    case 'cat-file': {
      const rawPath = cli.args[0];

      if (!rawPath) {
        throw new Error('File path is required');
      }

      await commands.cutFile.execute(rawPath);
      break;
    }

    case 'branch': {
      const name = cli.args[0];

      if (!name) {
        throw new Error('File path is required');
      }

      await commands.branch.execute(name);
      break;
    }

    case 'checkout': {
      const branch = cli.args[0];

      if (!branch) {
        throw new Error('File path is required');
      }

      await commands.checkout.execute(branch);
      break;
    }

    case 'log': {
      await commands.log.execute();
      break;
    }

    default: {
      services.logger.error(`Unknown command: ${cli.command}`);
      break;
    }
  }
};

main().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
