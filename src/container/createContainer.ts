import { createServices, Services } from './createServices';
import { createCommands, Commands } from './createCommands';

export interface Container {
  services: Services;
  commands: Commands;
}

export const createContainer = (): Container => {
  const services = createServices();
  const commands = createCommands(services);

  return {
    services,
    commands,
  };
};
