import type { ATSAdapter, AgencyConfig } from './types.js';
import { MockAdapter } from './mock.js';
import { BullhornAdapter } from './bullhorn.js';
import { LeverAdapter } from './lever.js';
import { GreenhouseAdapter } from './greenhouse.js';

export function createATSAdapter(config: AgencyConfig): ATSAdapter {
  switch (config.ats.system) {
    case 'bullhorn': return new BullhornAdapter(config);
    case 'lever': return new LeverAdapter(config);
    case 'greenhouse': return new GreenhouseAdapter(config);
    default: return new MockAdapter();
  }
}

export * from './types.js';
export { MockAdapter } from './mock.js';
