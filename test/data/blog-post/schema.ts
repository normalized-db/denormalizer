import { ISchemaConfig } from '@normalized-db/core';

export const SCHEMA: ISchemaConfig = {
  _defaults: {
    key: 'id',
    autoKey: true
  },
  _authored: {
    targets: {
      author: 'user'
    }
  },
  role: true,
  user: {
    key: 'userName',
    targets: {
      role: 'role'
    }
  },
  article: {
    parent: '_authored',
    targets: {
      comments: {
        type: 'comment',
        cascadeRemoval: true,
        isArray: true
      }
    }
  },
  comment: '_authored'
};
