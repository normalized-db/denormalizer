import { Depth, FetchCallback, ISchema, isNull, KeyMap, NormalizedData, ValidKey } from '@normalized-db/core';
import { IDenormalizer } from './denormalizer-interface';
import { BasicDenormalizer } from './implementation/basic-denormalizer';
import { ReverseReferenceDenormalizer } from './implementation/reverse-reference-denormalizer';

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

  public applyAll<T>(type: string, data: T[], depth?: number | Depth): Promise<T[]> {
    return this.implementation.applyAll<T>(type, data, depth);
  }

  public applyAllKeys<Key extends ValidKey, T>(type: string, keys: Key[], depth?: number | Depth): Promise<T[]> {
    return this.implementation.applyAllKeys<Key, T>(type, keys, depth);
  }

  public apply<T>(type: string, data: T, depth?: number | Depth): Promise<T> {
    return this.implementation.apply<T>(type, data, depth);
  }

  public applyKey<Key extends ValidKey, T>(type: string, key: Key, depth?: number | Depth): Promise<T> {
    return this.implementation.applyKey<Key, T>(type, key, depth);
  }

  protected buildDenormalizer(): IDenormalizer {
    return this.deleteReverseRefs
      ? new ReverseReferenceDenormalizer(this.schema, this.normalizedData, this.keys, this.fetchCallback)
      : new BasicDenormalizer(this.schema, this.normalizedData, this.keys, this.fetchCallback);
  }
}
