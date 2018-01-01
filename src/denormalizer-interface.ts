import { Depth, NdbDocument, ValidKey } from '@normalized-db/core';

export interface IDenormalizer {
  applyAll<T extends NdbDocument>(type: string, data: T[], depth?: number | Depth): Promise<T[]>;

  applyAllKeys<Key extends ValidKey, T extends NdbDocument>(type: string,
                                                            keys: Key[],
                                                            depth?: number | Depth): Promise<T[]>;

  apply<T extends NdbDocument>(type: string, data: T, depth?: number | Depth): Promise<T>;

  applyKey<Key extends ValidKey, T extends NdbDocument>(type: string, key: Key, depth?: number | Depth): Promise<T>;
}
