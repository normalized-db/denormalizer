import { Depth, ValidKey } from '@normalized-db/core';

export interface IDenormalizer {
  applyAll<T>(type: string, data: T[], depth?: number | Depth): Promise<T[]>;

  applyAllKeys<Key extends ValidKey, T>(type: string, keys: Key[], depth?: number | Depth): Promise<T[]>;

  apply<T>(type: string, data: T, depth?: number | Depth): Promise<T>;

  applyKey<Key extends ValidKey, T>(type: string, key: Key, depth?: number | Depth): Promise<T>;
}
