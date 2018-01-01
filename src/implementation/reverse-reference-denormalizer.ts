import { Depth, NdbDocument } from '@normalized-db/core';
import { BasicDenormalizer } from './basic-denormalizer';

export class ReverseReferenceDenormalizer extends BasicDenormalizer {

  protected async applyTarget(type: string, data: NdbDocument, depth?: number | Depth): Promise<NdbDocument> {
    const denormalizedTarget: any = await super.applyTarget(type, data, depth);
    if ('_refs' in denormalizedTarget) {
      delete denormalizedTarget['_refs'];
    }

    return denormalizedTarget;
  }
}
