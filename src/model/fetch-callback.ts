import { ValidKey } from '@normalized-db/core';

export declare type FetchCallback = (key: ValidKey, type: string) => Promise<any | any[]>;
