import { Depth } from '@normalized-db/core';
import { BasicDenormalizer } from './basic-denormalizer';

export class ReverseReferenceDenormalizer extends BasicDenormalizer {

  protected async applyTarget(type: string, data: any | any[], depth?: number | Depth): Promise<any[]> {
    const denormalizedTarget = await super.applyTarget(type, data, depth);
    if ('_refs' in denormalizedTarget) {
      delete denormalizedTarget['_refs'];
    }

    return denormalizedTarget;
  }
}
