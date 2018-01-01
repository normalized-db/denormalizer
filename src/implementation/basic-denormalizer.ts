import {
  deepClone, Depth, FetchCallback, InvalidTypeError, ISchema, isNull, isObject, IStore, IStoreTargetItem, KeyMap,
  NdbDocument, NormalizedData, NotFoundError, TypeMismatchError, ValidKey
} from '@normalized-db/core';
import { IDenormalizer } from '../denormalizer-interface';

export class BasicDenormalizer implements IDenormalizer {

  constructor(private _schema: ISchema,
              private _normalizedData?: NormalizedData,
              private _keys?: KeyMap,
              private _fetchCallback?: FetchCallback) {
    if (isNull(this._normalizedData)) {
      this._normalizedData = {};
    }

    if (isNull(this._keys)) {
      this._keys = {};
      this._schema.getTypes().forEach(type => {
        if (type in this._normalizedData) {
          const config = this._schema.getConfig(type);
          this._keys[type] = new Map<any, number>(this._normalizedData[type].map<[any, number]>((item, index) => [
            item[config.key],
            index
          ]));
        } else {
          this._keys[type] = new Map<any, number>();
        }
      });
    }
  }

  public async applyAll<T extends NdbDocument>(type: string, data: T[], depth?: number | Depth): Promise<T[]> {
    this.validateType(type);
    return await this.denormalizeArray(type, data, depth);
  }

  public async applyAllKeys<Key extends ValidKey, T extends NdbDocument>(type: string,
                                                                         keys: Key[],
                                                                         depth?: number | Depth): Promise<T[]> {
    this.validateType(type);
    return await Promise.all(keys.map(async key => await this.applyKey<Key, T>(type, key, depth)));
  }

  public async apply<T extends NdbDocument>(type: string, data: T, depth?: number | Depth): Promise<T> {
    this.validateType(type);

    if (isObject(data)) {
      return await this.denormalizeObject(type, data, depth);
    } else {
      return data;
    }
  }

  public async applyKey<Key extends ValidKey, T extends NdbDocument>(type: string,
                                                                     key: Key,
                                                                     depth?: number | Depth): Promise<T> {
    this.validateType(type);

    if (!this._keys[type].has(key)) {
      if (this._fetchCallback) {
        const fetchedData = await this._fetchCallback(type, key);
        if (fetchedData) {
          if (type in this._normalizedData) {
            this._keys[type].set(key, this._normalizedData[type].length);
            this._normalizedData[type].push(fetchedData);
          } else {
            this._keys[type].set(key, 0);
            this._normalizedData[type] = [fetchedData];
          }

          return await this.apply(type, deepClone(fetchedData), depth);
        } else {
          this.notFound(type, key);
        }

      } else {
        this.notFound(type, key);
      }
    }

    const data = this._normalizedData[type][this._keys[type].get(key)];
    return await this.apply(type, deepClone(data), depth);
  }

  protected async denormalizeArray(type: string, data: NdbDocument[], depth: number | Depth): Promise<any> {
    // TODO: check for arrays, empty objects
    return await Promise.all(data.map(item => this.denormalizeObject(type, item, depth)));
  }

  protected async denormalizeObject(type: string, data: NdbDocument, depth: number | Depth): Promise<any> {
    const config = this._schema.getConfig(type);
    if (!isNull(config.targets)) {
      await this.denormalizeTargets(type, data, config, depth);
    }

    return data;
  }

  protected async denormalizeTargets(type: string,
                                     data: NdbDocument,
                                     config: IStore,
                                     depth: number | Depth): Promise<void> {
    const promises = Object.keys(config.targets)
      .filter(field => field in data && !isNull(data[field]))
      .map(async field => {
        const { done, nextDepth } = this.validateDepth(depth, field);
        if (!done) {
          data[field] = await this.denormalizeTarget(data[field], config.targets[field], type, field, nextDepth);
        }
      });

    await Promise.all(promises);
  }

  protected async denormalizeTarget(keys: any | any[],
                                    target: IStoreTargetItem,
                                    parent: string,
                                    parentField: string,
                                    depth: number | Depth): Promise<any> {
    this.validateArrayType(target, parent, parentField, keys);

    const isArray = Array.isArray(keys);
    if (!isArray) {
      keys = [keys];
    }

    const targetType = target.type;
    const resultPromises = keys.map(async key => {
      const targetConfig = this._schema.getConfig(targetType);
      if (isNull(key) || (typeof key === 'object' && targetConfig.key in key)) {
        // key is `null` or target is already denormalized
        // -> key cannot be denormalized or already contains the final object
        return key;
      }

      const typeKeys = this._keys[targetType];
      if (!typeKeys.has(key) && this._fetchCallback) {
        const data = await this._fetchCallback(targetType, key);
        if (data) {
          if (targetType in this._normalizedData) {
            typeKeys.set(key, this._normalizedData[targetType].length);
            this._normalizedData[targetType].push(data);
          } else {
            typeKeys.set(key, 0);
            this._normalizedData[targetType] = [data];
          }

          return await this.apply(targetType, deepClone(data), depth);
        }
      }

      if (typeKeys.has(key)) {
        const targetObject = this._normalizedData[targetType][typeKeys.get(key)];
        return await this.applyTarget(targetType, deepClone(targetObject), depth);
      }

      return key; // target not found -> return key only
    });

    const result = await Promise.all(resultPromises);
    return isArray ? result : result[0];
  }

  protected applyTarget(type: string, data: NdbDocument, depth?: number | Depth): Promise<NdbDocument> {
    return this.apply(type, data, depth);
  }

  protected validateDepth(depth: number | Depth, field: string): { done: boolean, nextDepth: number | Depth } {
    if (isNull(depth)) {
      return { done: false, nextDepth: null }; // no depth -> imply endless denormalization
    } else if (typeof depth === 'number') {
      return { done: depth <= 0, nextDepth: depth - 1 };
    } else {
      if (field in depth) {
        const typeDepth = depth[field];
        if (isNull(typeDepth)) {
          // depth{[field]:null} -> denormalized without depth
          return { done: false, nextDepth: null };
        } else if (typeof typeDepth === 'number') {
          // depth{[field]:number} -> reduce depth
          return { done: typeDepth < 0, nextDepth: typeDepth - 1 };
        } else {
          // depth{[field]:Depth} -> denormalize `field` but filter its props by [field]
          return { done: false, nextDepth: typeDepth };
        }
      } else {
        return { done: true, nextDepth: depth }; // non-contained fields are excluded
      }
    }
  }

  protected validateArrayType(target: IStoreTargetItem, parent: string, parentField: string, data: any | any[]) {
    if (isNull(data)) {
      return;
    }

    if (target.isArray) {
      if (!Array.isArray(data)) {
        throw new TypeMismatchError(parent, parentField, true);
      }
    } else if (Array.isArray(data)) {
      throw new TypeMismatchError(parent, parentField, false);
    }
  }

  protected validateType(type: string) {
    if (!this._schema.hasType(type)) {
      throw new InvalidTypeError(type);
    }
  }

  protected notFound(type: string, key: ValidKey) {
    throw new NotFoundError(type, key);
  }
}
