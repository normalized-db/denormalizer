import { ISchemaConfig } from '@normalized-db/core';

export const SCHEMA: ISchemaConfig = {
  _defaults: {
    key: 'id',
    autoKey: true
  },
  user: {
    targets: {
      role: 'role'
    }
  },
  role: true
};
