import { ISchema, isNull, KeyMap, NormalizedData, ValidKey } from '@normalized-db/core';
import { IDenormalizer } from './denormalizer-interface';
import { BasicDenormalizer } from './implementation/basic-denormalizer';
import { ReverseReferenceDenormalizer } from './implementation/reverse-reference-denormalizer';
import { Depth } from './model/depth';
import { FetchCallback } from './model/fetch-callback';

export class Denormalizer implements IDenormalizer {

  private readonly implementation: IDenormalizer;

  constructor(private readonly schema: ISchema,
              private readonly normalizedData: NormalizedData,
              private readonly keys?: KeyMap,
              private readonly deleteReverseRefs: boolean = false,
              private readonly fetchCallback?: FetchCallback) {
    if (isNull(schema)) {
      throw new Error('Cannot create a normalizer without a schema');
    }

    if (isNull(normalizedData)) {
      throw new Error('Cannot create a normalizer without normalized data');
    }

    this.implementation = this.buildDenormalizer();
  }

  public applyAll<T>(data: T[], type: string, depth?: number | Depth): Promise<T[]> {
    return this.implementation.applyAll<T>(data, type, depth);
  }

  public applyAllKeys<Key extends ValidKey, T>(keys: Key[], type: string, depth?: number | Depth): Promise<T[]> {
    return this.implementation.applyAllKeys<Key, T>(keys, type, depth);
  }

  public apply<T>(data: T, type: string, depth?: number | Depth): Promise<T> {
    return this.implementation.apply<T>(data, type, depth);
  }

  public applyKey<Key extends ValidKey, T>(key: Key, type: string, depth?: number | Depth): Promise<T> {
    return this.implementation.applyKey<Key, T>(key, type, depth);
  }

  protected buildDenormalizer(): IDenormalizer {
    return this.deleteReverseRefs
      ? new ReverseReferenceDenormalizer(this.schema, this.normalizedData, this.keys, this.fetchCallback)
      : new BasicDenormalizer(this.schema, this.normalizedData, this.keys, this.fetchCallback);
  }
}
