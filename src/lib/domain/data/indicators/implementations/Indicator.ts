import { IndicatorConfig } from '../interfaces/IndicatorConfig';

export class Indicator {
  constructor(public cfg: IndicatorConfig) {
    this.cfg.id;
  }
}
