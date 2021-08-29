
import constants from '../constants';

import { BackgroundService } from './BackgroundService';
import { CanellationToken } from './CanellationToken';

export const serviceNames = constants.ServiceNames;

export class SimpleTask extends BackgroundService {
  protected override run(token: CanellationToken): Promise<void> {
    token;
    throw new Error('Method not implemented.');
  }
}
