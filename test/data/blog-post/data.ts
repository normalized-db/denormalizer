import { deepClone } from '@normalized-db/core';

export const normalizeUser = (user: any) => {
  const copy = deepClone(user);
  copy.role = copy.role.id;
  return copy;
};

export const normalizeAllUsers = (users: any[]) => users.map(normalizeUser);

export const normalizeComment = (comment: any) => {
  const copy = deepClone(comment);
  copy.author = copy.author.userName;
  return copy;
};

export const normalizeAllComments = (comments: any[]) => comments.map(normalizeComment);

export const normalizePost = (post: any) => {
  const copy = deepClone(post);
  copy.author = copy.author.userName;
  if (copy.comments) {
    copy.comments = copy.comments.map(c => c.id);
  }
  return copy;
};

export const normalizeAllPosts = (posts: any[]) => posts.map(normalizePost);

export const withRevRef = (object: any, key: string, refs: IDBValidKey[], cloned = false) => {
  const result = cloned ? deepClone(object) : object;
  result._refs = { [key]: new Set(refs) };
  
  return result;
};

export const ROLE1 = {
  id: 1,
  label: 'Subscriber'
};

export const ROLE2 = {
  id: 2,
  label: 'Journalist'
};

export const ROLE3 = {
  id: 3,
  label: 'Freelancer'
};

export const USER_ALEXK = {
  userName: 'alexk',
  firstName: 'Alexandra',
  lastName: 'König',
  email: 'alex.koenig@domain.at',
  role: ROLE1
};

export const USER_MMUSTER = {
  userName: 'mmuster',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'mmuster@newspaper.at',
  role: ROLE2
};

export const USER_PLUSTIG = {
  userName: 'plustig',
  firstName: 'Petra',
  lastName: 'Lustig',
  email: 'office@lustig-news.at',
  role: ROLE3
};

export const USER_TIMLER42 = {
  userName: 'timler42',
  firstName: 'Tim',
  lastName: 'Müller',
  email: 'timmueller@mail.com',
  role: ROLE1
};

export const COMMENT1 = {
  id: 1,
  text: 'Comment #1',
  createdDate: {
    date: '2017-07-05 10:14:13.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_TIMLER42
};

export const COMMENT2 = {
  id: 3,
  text: 'Comment #3',
  createdDate: {
    date: '2017-07-05 10:38:03.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_ALEXK
};

export const COMMENT3 = {
  id: 2,
  text: 'Comment #2',
  createdDate: {
    date: '2017-07-07 14:01:31.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_ALEXK
};

export const POST1 = {
  id: 1,
  title: 'Lorem ipsum',
  text: 'Lorem ipsum dolor sit amet, ne fugit voluptatum ullamcorper qui, reformidans definitionem ei his.',
  createdDate: {
    date: '2017-07-05 09:08:22.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_MMUSTER,
  comments: [
    COMMENT1,
    COMMENT2
  ]
};

export const POST2 = {
  id: 2,
  title: 'Bacon ipsum',
  text: 'Bacon ipsum dolor amet kevin biltong andouille pig jerky.',
  createdDate: {
    date: '2017-07-07 14:01:31.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_PLUSTIG,
  comments: [COMMENT3]
};

export const POST3 = {
  id: 3,
  title: 'Cupcake ipsum',
  text: 'Cupcake ipsum dolor. Sit amet marshmallow sesame snaps donut dessert',
  createdDate: {
    date: '2017-07-07 16:45:01.000000',
    timezone_type: 3,
    timezone: 'Europe/Berlin'
  },
  author: USER_MMUSTER
};

export const DATA = [POST1, POST2, POST3];

export const DATA_NORMALIZED = {
  role: [ROLE2, ROLE1, ROLE3],
  user: normalizeAllUsers([USER_MMUSTER, USER_TIMLER42, USER_ALEXK, USER_PLUSTIG]),
  article: normalizeAllPosts([POST1, POST2, POST3]),
  comment: normalizeAllComments([COMMENT1, COMMENT2, COMMENT3])
};

export const DATA_NORMALIZED_RR = deepClone(DATA_NORMALIZED);

withRevRef(DATA_NORMALIZED_RR.role[0], 'user', ['mmuster']);
withRevRef(DATA_NORMALIZED_RR.role[1], 'user', ['timler42', 'alexk']);
withRevRef(DATA_NORMALIZED_RR.role[2], 'user', ['plustig']);

withRevRef(DATA_NORMALIZED_RR.user[0], 'article', [1, 3]);
withRevRef(DATA_NORMALIZED_RR.user[1], 'comment', [1]);
withRevRef(DATA_NORMALIZED_RR.user[2], 'comment', [3, 2]);
withRevRef(DATA_NORMALIZED_RR.user[3], 'article', [2]);

withRevRef(DATA_NORMALIZED_RR.comment[0], 'article', [1]);
withRevRef(DATA_NORMALIZED_RR.comment[1], 'article', [1]);
withRevRef(DATA_NORMALIZED_RR.comment[2], 'article', [2]);
