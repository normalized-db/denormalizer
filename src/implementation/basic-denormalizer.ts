import {
  deepClone,
  Depth,
  FetchCallback,
  ISchema,
  isNull,
  isObject,
  IStore,
  IStoreTargetItem,
  KeyMap,
  NormalizedData,
  ValidKey
} from '@normalized-db/core';
import { IDenormalizer } from '../denormalizer-interface';

export class BasicDenormalizer implements IDenormalizer {

  constructor(private schema: ISchema,
              private normalizedData: NormalizedData,
              private keys?: KeyMap,
              private fetchCallback?: FetchCallback) {
    if (isNull(this.keys)) {
      this.keys = {};
      this.schema.getTypes().forEach(type => {
        if (type in this.normalizedData) {
          const config = this.schema.getConfig(type);
          this.keys[type] = new Map(this.normalizedData[type].map<[any, number]>(
            (item, index) => [item[config.key], index])
          );
        } else {
          this.keys[type] = new Map();
        }
      });
    }
  }

  public async applyAll<T>(data: T[], type: string, depth?: number | Depth): Promise<T[]> {
    this.validateType(type);

    return await this.denormalizeArray(data, type, depth);
  }

  public async applyAllKeys<Key extends ValidKey, T>(keys: Key[], type: string, depth?: number | Depth): Promise<T[]> {
    this.validateType(type);

    return await Promise.all(keys.map(async key => await this.applyKey<Key, T>(key, type, depth)));
  }

  public async apply<T>(data: T, type: string, depth?: number | Depth): Promise<T> {
    this.validateType(type);

    if (isObject(data)) {
      return await this.denormalizeObject(data, type, depth);
    } else {
      return data;
    }
  }

  public async applyKey<Key extends ValidKey, T>(key: Key, type: string, depth?: number | Depth): Promise<T> {
    this.validateType(type);

    if (!this.keys[type].has(key)) {
      if (this.fetchCallback) {
        const fetchedData = await this.fetchCallback(key, type);
        if (fetchedData) {
          if (type in this.normalizedData) {
            this.keys[type].set(key, this.normalizedData[type].length);
            this.normalizedData[type].push(fetchedData);
          } else {
            this.keys[type].set(key, 0);
            this.normalizedData[type] = [fetchedData];
          }

          return await this.apply(deepClone(fetchedData), type, depth);
        } else {
          this.notFound(type, key);
        }

      } else {
        this.notFound(type, key);
      }
    }

    const data = this.normalizedData[type][this.keys[type].get(key)];
    return await this.apply(deepClone(data), type, depth);
  }

  protected async denormalizeArray(data: any[], type: string, depth: number | Depth): Promise<any> {
    // TODO: check for arrays, empty objects
    return await Promise.all(data.map(item => this.denormalizeObject(item, type, depth)));
  }

  protected async denormalizeObject(data: any, type: string, depth: number | Depth): Promise<any> {
    const config = this.schema.getConfig(type);
    if (!isNull(config.targets)) {
      await this.denormalizeTargets(data, type, config, depth);
    }

    return data;
  }

  protected async denormalizeTargets(data: any, type: string, config: IStore, depth: number | Depth): Promise<void> {
    const promises = Object.keys(config.targets)
      .filter(field => field in data && !isNull(data[field]))
      .map(async field => {
        const { done, nextDepth } = this.validateDepth(depth, field);
        if (!done) {
          data[field] = await this.denormalizeTarget(data[field], config.targets[field], type, nextDepth);
        }
      });

    await Promise.all(promises);
  }

  protected async denormalizeTarget(keys: any | any[],
                                    target: IStoreTargetItem,
                                    parent: string,
                                    depth: number | Depth): Promise<any> {
    const isArray = Array.isArray(keys);
    this.validateArrayType(target, parent, isArray);

    if (!isArray) {
      keys = [keys];
    }

    const targetType = target.type;
    const resultPromises = keys.map(async key => {
      const targetConfig = this.schema.getConfig(targetType);
      if (isNull(key) || (typeof key === 'object' && targetConfig.key in key)) {
        // key is `null` or target is already denormalized
        // -> key cannot be denormalized or already contains the final object
        return key;
      }

      const typeKeys = this.keys[targetType];
      if (!typeKeys.has(key) && this.fetchCallback) {
        const data = await this.fetchCallback(key, targetType);
        if (data) {
          if (targetType in this.normalizedData) {
            typeKeys.set(key, this.normalizedData[targetType].length);
            this.normalizedData[targetType].push(data);
          } else {
            typeKeys.set(key, 0);
            this.normalizedData[targetType] = [data];
          }

          return await this.apply(deepClone(data), targetType, depth);
        }
      }

      if (typeKeys.has(key)) {
        const targetObject = this.normalizedData[targetType][typeKeys.get(key)];
        return await this.applyTarget(deepClone(targetObject), targetType, depth);
      }

      return key; // target not found -> return key only
    });

    const result = await Promise.all(resultPromises);
    return isArray ? result : result[0];
  }

  protected applyTarget(data: any, type: string, depth?: number | Depth): Promise<any> {
    return this.apply(data, type, depth);
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

  protected validateArrayType(target: IStoreTargetItem, parent: string, isArray: boolean) {
    if (target.isArray) {
      if (!isArray) {
        throw new Error('\'' + parent + '\' is expected to have an array of \'' + target.type + '\' but got object');
      }
    } else if (isArray) {
      throw new Error('\'' + parent + '\' is expected to have an object of \'' + target.type + '\' but got array');
    }
  }

  protected validateType(type: string) {
    if (!this.schema.hasType(type)) {
      throw new Error('Type \'' + type + '\' is not defined');
    }
  }

  protected notFound(type: string, key: ValidKey) {
    throw new Error('Could not find \'' + type + '\' with key \'' + String(key) + '\'');
  }
}
