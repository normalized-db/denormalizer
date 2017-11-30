import { FetchCallback, ISchema, ISchemaConfig, KeyMap, NormalizedData, Schema } from '@normalized-db/core';
import { Denormalizer } from '../denormalizer';
import { IDenormalizerBuilder } from './denormalizer.builder-interface';

export class DenormalizerBuilder implements IDenormalizerBuilder {

  private _schema: ISchema;
  private _normalizedData: NormalizedData = {};
  private _keys: KeyMap;
  private _deleteReverseRefs: boolean;
  private _fetchCallback: FetchCallback;

  public schema(schema: ISchema): DenormalizerBuilder {
    this._schema = schema;
    return this;
  }

  public schemaConfig(schemaConfig: ISchemaConfig): DenormalizerBuilder {
    this._schema = new Schema(schemaConfig);
    return this;
  }

  public normalizedData(data: NormalizedData): DenormalizerBuilder {
    this._normalizedData = data;
    return this;
  }

  public keys(keys: KeyMap): DenormalizerBuilder {
    this._keys = keys;
    return this;
  }

  public reverseRefsDeleted(deleteReverseRefs: boolean): DenormalizerBuilder {
    this._deleteReverseRefs = deleteReverseRefs;
    return this;
  }

  public fetchCallback(fetchCallback: FetchCallback): DenormalizerBuilder {
    this._fetchCallback = fetchCallback;
    return this;
  }

  public build(): Denormalizer {
    return new Denormalizer(
      this._schema,
      this._normalizedData,
      this._keys,
      this._deleteReverseRefs,
      this._fetchCallback
    );
  }
}
