import { Depth } from '@normalized-db/core';
import { BasicDenormalizer } from './basic-denormalizer';

export class ReverseReferenceDenormalizer extends BasicDenormalizer {

  protected async applyTarget(data: any | any[], type: string, depth?: number | Depth): Promise<any[]> {
    const denormalizedTarget = await super.applyTarget(data, type, depth);
    if ('_refs' in denormalizedTarget) {
      delete denormalizedTarget['_refs'];
    }

    return denormalizedTarget;
  }
}
