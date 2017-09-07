import { ISchema, ISchemaConfig, KeyMap, NormalizedData, Schema } from '@normalized-db/core';
import { Denormalizer } from './denormalizer';
import { FetchCallback } from './model/fetch-callback';

export class DenormalizerBuilder {

  private schema: ISchema;
  private normalizedData: NormalizedData = {};
  private keys: KeyMap;
  private deleteReverseRefs: boolean;
  private fetchCallback: FetchCallback;

  public withSchema(schema: ISchema): DenormalizerBuilder {
    this.schema = schema;
    return this;
  }

  public withSchemaConfig(schemaConfig: ISchemaConfig): DenormalizerBuilder {
    this.schema = new Schema(schemaConfig);
    return this;
  }

  public withNormalizedData(data: NormalizedData): DenormalizerBuilder {
    this.normalizedData = data;
    return this;
  }

  public withKeys(keys: KeyMap): DenormalizerBuilder {
    this.keys = keys;
    return this;
  }

  public withReverseRefsDeleted(deleteReverseRefs: boolean): DenormalizerBuilder {
    this.deleteReverseRefs = deleteReverseRefs;
    return this;
  }

  public withFetchCallback(fetchCallback: FetchCallback): DenormalizerBuilder {
    this.fetchCallback = fetchCallback;
    return this;
  }

  public get build(): Denormalizer {
    return new Denormalizer(
      this.schema,
      this.normalizedData,
      this.keys,
      this.deleteReverseRefs,
      this.fetchCallback
    );
  }
}
