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

main().catch(console.error);
