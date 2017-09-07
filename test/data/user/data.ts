import { deepClone } from '@normalized-db/core';

export const normalize = user => {
  const copy = deepClone(user);
  copy.role = copy.role.id;
  return copy;
};

export const normalizeAll = users => users.map(normalize);

export const reverseRole = (role, users) => {
  const copy = deepClone(role);
  copy._refs = {
    user: new Set(users.map(u => u.id))
  };
  return copy;
};

export const ROLE1 = {
  id: 1,
  name: 'Admin'
};

export const ROLE2 = {
  id: 2,
  name: 'User'
};

export const USER1 = {
  id: 1,
  name: 'Max Muster',
  role: ROLE1
};

export const USER2 = {
  id: 2,
  name: 'Peter Berger',
  role: ROLE2
};

export const USER3 = {
  id: 3,
  name: 'Maria Anderst',
  role: ROLE2
};

export const DATA = [
  USER1,
  USER2,
  USER3
];

export const DATA_NORMALIZED = {
  role: [
    ROLE1,
    ROLE2
  ],
  user: normalizeAll(DATA)
};

export const DATA_NORMALIZED_RR = {
  role: [
    reverseRole(ROLE1, [USER1]),
    reverseRole(ROLE2, [USER2, USER3])
  ],
  user: normalizeAll(DATA)
};
