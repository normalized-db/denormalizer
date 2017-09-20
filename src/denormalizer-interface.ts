import { Depth, ValidKey } from '@normalized-db/core';

export interface IDenormalizer {
  applyAll<T>(data: T[], type: string, depth?: number | Depth): Promise<T[]>;

  applyAllKeys<Key extends ValidKey, T>(keys: Key[], type: string, depth?: number | Depth): Promise<T[]>;

  apply<T>(data: T, type: string, depth?: number | Depth): Promise<T>;

  applyKey<Key extends ValidKey, T>(key: Key, type: string, depth?: number | Depth): Promise<T>;
}
