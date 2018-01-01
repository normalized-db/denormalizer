import {
  Depth, FetchCallback, ISchema, isNull, KeyMap, NdbDocument, NormalizedData,
  ValidKey
} from '@normalized-db/core';
import { IDenormalizer } from './denormalizer-interface';
import { BasicDenormalizer } from './implementation/basic-denormalizer';
import { ReverseReferenceDenormalizer } from './implementation/reverse-reference-denormalizer';

export class Denormalizer implements IDenormalizer {

  private readonly _implementation: IDenormalizer;

  constructor(private readonly _schema: ISchema,
              private readonly _normalizedData?: NormalizedData,
              private readonly _keys?: KeyMap,
              private readonly _deleteReverseRefs: boolean = false,
              private readonly _fetchCallback?: FetchCallback) {
    if (isNull(_schema)) {
      throw new Error('Cannot create a normalizer without a schema');
    }

    this._implementation = this.buildDenormalizer();
  }

  public applyAll<T extends NdbDocument>(type: string, data: T[], depth?: number | Depth): Promise<T[]> {
    return this._implementation.applyAll<T>(type, data, depth);
  }

  public applyAllKeys<Key extends ValidKey, T extends NdbDocument>(type: string,
                                                                   keys: Key[],
                                                                   depth?: number | Depth): Promise<T[]> {
    return this._implementation.applyAllKeys<Key, T>(type, keys, depth);
  }

  public apply<T extends NdbDocument>(type: string, data: T, depth?: number | Depth): Promise<T> {
    return this._implementation.apply<T>(type, data, depth);
  }

  public applyKey<Key extends ValidKey, T extends NdbDocument>(type: string,
                                                               key: Key,
                                                               depth?: number | Depth): Promise<T> {
    return this._implementation.applyKey<Key, T>(type, key, depth);
  }

  protected buildDenormalizer(): IDenormalizer {
    return this._deleteReverseRefs
      ? new ReverseReferenceDenormalizer(this._schema, this._normalizedData, this._keys, this._fetchCallback)
      : new BasicDenormalizer(this._schema, this._normalizedData, this._keys, this._fetchCallback);
  }
}
